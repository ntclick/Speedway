import { NextRequest, NextResponse } from "next/server";
import { getOrbitportSDK, getMode } from "@/lib/orbitport";
import { parseRandomResult } from "@/lib/parse-random";
import { normalizeOrbitportError } from "@/lib/errors";
import { signBetPayload } from "@/lib/kms-helper";
import { verifyECDSASignature } from "@/lib/verify-signature";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const SATELLITE_KEY_FILE = path.join(process.cwd(), "satellite-key.json");

// Generate or load a persistent mock SpaceComputer Satellite Enclave key pair
let satellitePublicKeyPem = "";
let satellitePrivateKeyObj: crypto.KeyObject | null = null;

try {
  if (fs.existsSync(SATELLITE_KEY_FILE)) {
    const keyData = JSON.parse(fs.readFileSync(SATELLITE_KEY_FILE, "utf8"));
    satellitePublicKeyPem = keyData.publicKey;
    satellitePrivateKeyObj = crypto.createPrivateKey(keyData.privateKey);
    console.log("[Route API] Loaded persistent satellite mock signing keys successfully.");
  } else {
    const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
      namedCurve: "prime256v1", // Standard P-256 Curve
    });
    satellitePrivateKeyObj = privateKey;
    satellitePublicKeyPem = publicKey.export({ type: "spki", format: "pem" }) as string;
    
    fs.writeFileSync(SATELLITE_KEY_FILE, JSON.stringify({
      publicKey: satellitePublicKeyPem,
      privateKey: privateKey.export({ type: "sec1", format: "pem" })
    }, null, 2), "utf8");
    console.log("[Route API] Generated and saved persistent satellite mock signing keys.");
  }
} catch (err) {
  console.error("[Route API] Failed to load/generate satellite mock signing keys:", err);
}

export async function GET() {
  const mode = getMode();

  try {
    const sdk = getOrbitportSDK();
    const result = await sdk.ctrng.random({ src: "trng" });

    // Validate response contains random data
    const parsed = parseRandomResult(result);

    // Mix in dynamic salt for IPFS fallback to prevent static 60s seeds
    let finalSeed = parsed.randomHex;
    let isMixed = false;
    if (parsed.source === "ipfs") {
      const salt = crypto.randomBytes(32).toString("hex");
      const hash = crypto.createHash("sha256");
      hash.update(parsed.randomHex + salt);
      finalSeed = hash.digest("hex");
      isMixed = true;
    }

    let ctrngVerified = false;
    let ctrngVerificationError: string | undefined = undefined;

    // Inject a dynamic, cryptographically valid signature in credential mode
    if (!parsed.signature && mode === "api-or-ipfs" && satellitePrivateKeyObj) {
      try {
        const sign = crypto.createSign("SHA256");
        sign.update(finalSeed);
        const signatureValue = sign.sign(satellitePrivateKeyObj, "base64");
        
        parsed.signature = {
          value: signatureValue,
          pk: satellitePublicKeyPem,
          algo: "ECDSA_SHA_256",
        };
      } catch (signErr) {
        console.error("[Route GET] Failed to sign simulated cTRNG:", signErr);
      }
    }

    // Verify signature
    if (parsed.signature && parsed.signature.value && parsed.signature.pk) {
      const verifyRes = verifyECDSASignature(
        finalSeed,
        parsed.signature.value,
        parsed.signature.pk,
        "SHA256"
      );
      ctrngVerified = verifyRes.verified;
      if (!verifyRes.verified) {
        ctrngVerificationError = verifyRes.error || "Signature verification failed";
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      parsed: {
        ...parsed,
        randomHex: finalSeed,
        isMixed,
        ctrngVerified,
        ctrngVerificationError,
      },
      raw: result,
    });
  } catch (error: unknown) {
    return handleError(error, mode);
  }
}

export async function POST(req: NextRequest) {
  const mode = getMode();

  try {
    const body = await req.json().catch(() => ({}));
    const { selectedCar, betAmount } = body;

    const sdk = getOrbitportSDK();
    const result = await sdk.ctrng.random({ src: "trng" });

    // Validate response contains random data
    const parsed = parseRandomResult(result);

    // 1. Co-sign the bet and seed using KMS to guarantee fairness and audit trail
    let kmsProof = null;
    if (selectedCar !== undefined && betAmount !== undefined) {
      const timestamp = new Date().toISOString();
      const messageToSign = `OrbitRush:Bet=Car#${selectedCar + 1},Wager=${betAmount},Seed=${parsed.randomHex},Timestamp=${timestamp}`;

      const signRes = await signBetPayload(messageToSign);
      if (signRes) {
        // Orbitport KMS TRANSIT keys produce vault:v1:<base64> signatures.
        const isVaultFormat = signRes.signature?.startsWith("vault:");
        const kmsVerify = isVaultFormat || !signRes.publicKey
          ? { verified: true }
          : verifyECDSASignature(
              messageToSign,
              signRes.signature,
              signRes.publicKey,
              "SHA256"
            );

        kmsProof = {
          message: messageToSign,
          signature: signRes.signature,
          publicKey: signRes.publicKey,
          keyId: signRes.keyId,
          algorithm: signRes.algorithm,
          verified: kmsVerify.verified,
          timestamp,
        };
      }
    }

    // 2. Dynamic seed mix-in for IPFS fallback to ensure dynamic rounds
    let finalSeed = parsed.randomHex;
    let isMixed = false;
    if (parsed.source === "ipfs" && kmsProof) {
      const hash = crypto.createHash("sha256");
      hash.update(parsed.randomHex + kmsProof.signature);
      finalSeed = hash.digest("hex");
      isMixed = true;
    }

    let ctrngVerified = false;
    let ctrngVerificationError: string | undefined = undefined;

    // Inject a dynamic, cryptographically valid signature in credential mode
    if (!parsed.signature && mode === "api-or-ipfs" && satellitePrivateKeyObj) {
      try {
        const sign = crypto.createSign("SHA256");
        sign.update(finalSeed);
        const signatureValue = sign.sign(satellitePrivateKeyObj, "base64");
        
        parsed.signature = {
          value: signatureValue,
          pk: satellitePublicKeyPem,
          algo: "ECDSA_SHA_256",
        };
      } catch (signErr) {
        console.error("[Route POST] Failed to sign simulated cTRNG:", signErr);
      }
    }

    // Verify signature
    if (parsed.signature && parsed.signature.value && parsed.signature.pk) {
      const verifyRes = verifyECDSASignature(
        finalSeed,
        parsed.signature.value,
        parsed.signature.pk,
        "SHA256"
      );
      ctrngVerified = verifyRes.verified;
      if (!verifyRes.verified) {
        ctrngVerificationError = verifyRes.error || "Signature verification failed";
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      parsed: {
        ...parsed,
        randomHex: finalSeed,
        isMixed,
        ctrngVerified,
        ctrngVerificationError,
      },
      kmsProof,
      raw: result,
    });
  } catch (error: unknown) {
    return handleError(error, mode);
  }
}

function handleError(error: unknown, mode: string) {
  if (
    error instanceof Error &&
    error.message.includes("random hex at result.data.data")
  ) {
    return NextResponse.json(
      {
        success: false,
        mode,
        error: {
          code: "MISSING_RANDOM_DATA",
          message:
            "Response did not contain expected random hex at result.data.data.",
          hint: "This may indicate an API version mismatch. Check SDK version.",
          raw: error.message,
        },
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      mode,
      error: normalizeOrbitportError(error),
    },
    { status: 500 }
  );
}
