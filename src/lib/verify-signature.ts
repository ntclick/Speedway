import crypto from "crypto";

/**
 * Verifies an ECDSA signature over a given string message.
 * Supports public keys in PEM format or raw base64/hex formats.
 */
export function verifyECDSASignature(
  message: string,
  signatureBase64: string,
  publicKey: string,
  algorithm: string = "SHA256"
): { verified: boolean; error?: string } {
  try {
    if (!signatureBase64 || !publicKey) {
      return { verified: false, error: "Missing signature or public key" };
    }

    // Convert signature from Base64 to a Buffer
    const signatureBuffer = Buffer.from(signatureBase64, "base64");

    // Format public key to PEM if it is not already in PEM format
    let formattedKey = publicKey.trim();
    if (!formattedKey.includes("-----BEGIN")) {
      // Clean clean newlines/spaces if it's base64 DER
      const base64Key = formattedKey.replace(/\s+/g, "");
      const lines = base64Key.match(/.{1,64}/g);
      if (lines) {
        formattedKey = `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
      }
    }

    // Choose hash algorithm
    let hashAlgo = "SHA256";
    if (algorithm.toUpperCase().includes("SHA_384") || algorithm.toUpperCase().includes("SHA384")) {
      hashAlgo = "SHA384";
    } else if (algorithm.toUpperCase().includes("SHA_512") || algorithm.toUpperCase().includes("SHA512")) {
      hashAlgo = "SHA512";
    }

    const verifier = crypto.createVerify(hashAlgo);
    verifier.update(message);
    
    const isVerified = verifier.verify(formattedKey, signatureBuffer);
    return { verified: isVerified };
  } catch (err: any) {
    console.error("[Verify Signature] Error verifying signature:", err);
    return { verified: false, error: err.message || String(err) };
  }
}
