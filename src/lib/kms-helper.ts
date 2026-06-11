import fs from "fs";
import path from "path";
import { getOrbitportSDK } from "./orbitport";

const KEY_FILE_PATH = path.join(process.cwd(), "kms-key.json");

interface KMSKeyData {
  keyId: string;
  alias: string;
  publicKey?: string | null;
  creationDate?: string;
}

/**
 * Gets or creates a KMS key for signing game bets.
 * Saves key metadata locally to kms-key.json.
 *
 * Note: Orbitport KMS TRANSIT scheme keys do not expose a public key via the API.
 * The signature is in vault:v1:<base64> format — verified by the orbital enclave itself.
 */
export async function getOrCreateKMSKey(): Promise<KMSKeyData | null> {
  // Check if we are running in credential-less mode
  const clientId = process.env.ORBITPORT_CLIENT_ID;
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    console.log("[KMS Helper] Missing API credentials, KMS signing is disabled");
    return null;
  }

  // Try to load cached key metadata
  if (fs.existsSync(KEY_FILE_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(KEY_FILE_PATH, "utf8"));
      if (data && data.keyId) {
        return data as KMSKeyData;
      }
    } catch (err) {
      console.error("[KMS Helper] Failed to read key file, recreating...", err);
    }
  }

  const sdk = getOrbitportSDK();

  try {
    const uniqueAlias = `orbit-rush-bet-signer-${Date.now()}`;
    console.log(`[KMS Helper] Creating new KMS key with alias: ${uniqueAlias}...`);

    const result = await (sdk as any).kms.createKey({
      alias: uniqueAlias,
      keySpec: "ECDSA_P256",
      keyUsage: "SIGN_VERIFY",
      scheme: "TRANSIT",
      description: "KMS Key for Orbit Rush Bet Verification",
      tags: [],
    });

    if (result && result.success && result.data?.KeyMetadata) {
      const meta = result.data.KeyMetadata;
      const keyData: KMSKeyData = {
        keyId: meta.KeyId,
        alias: meta.Alias || uniqueAlias,
        // TRANSIT keys do not expose a public key — this is expected
        publicKey: null,
        creationDate: meta.CreationDate,
      };

      fs.writeFileSync(KEY_FILE_PATH, JSON.stringify(keyData, null, 2), "utf8");
      console.log("[KMS Helper] Successfully created and cached KMS key:", keyData.keyId);
      return keyData;
    }

    console.error("[KMS Helper] Create key call was not successful:", result);
    return null;
  } catch (err) {
    console.error("[KMS Helper] Error creating KMS key:", err);
    return null;
  }
}

/**
 * Signs a game bet payload using the Orbitport KMS key.
 * Returns a vault:v1:<base64> signature that is verified by the orbital enclave.
 */
export async function signBetPayload(message: string): Promise<{
  signature: string;
  publicKey?: string;
  keyId: string;
  algorithm: string;
} | null> {
  const sdk = getOrbitportSDK();
  const keyData = await getOrCreateKMSKey();

  if (!keyData) {
    return null;
  }

  try {
    const result = await (sdk as any).kms.sign({
      keyId: keyData.keyId,
      message: message,
      signingAlgorithm: "ECDSA_SHA_256",
    });

    if (result && result.success && result.data) {
      return {
        signature: result.data.Signature,
        publicKey: keyData.publicKey ?? undefined,
        keyId: keyData.keyId,
        algorithm: "ECDSA_SHA_256",
      };
    }
    return null;
  } catch (err) {
    console.error("[KMS Helper] Error signing message with KMS:", err);
    return null;
  }
}
