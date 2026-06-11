import { OrbitportSDK, createStorage } from "@spacecomputer-io/orbitport-sdk-ts";

let cachedSDK: OrbitportSDK | null = null;

/**
 * Initialize Orbitport SDK with correct OrbitportConfig shape.
 * Config uses: apiUrl, authDomain, clientId, clientSecret
 * IMPORTANT: Only call from server-side code (API routes). Never import into client components.
 */
export function getOrbitportSDK(): OrbitportSDK {
  if (cachedSDK) {
    return cachedSDK;
  }

  const clientId = process.env.ORBITPORT_CLIENT_ID;
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET;
  const apiUrl = process.env.ORBITPORT_API_URL;
  const authDomain = process.env.ORBITPORT_AUTH_DOMAIN;

  if (clientId && clientSecret) {
    // Use memory token storage on serverless environments (like Vercel) to avoid EROFS (read-only file system) crashes
    const isServerless = !!process.env.VERCEL || !!process.env.LAMBDA_TASK_ROOT;
    const storage = createStorage({
      type: isServerless ? "memory" : "file",
      filePath: isServerless ? undefined : ".orbitport_token",
    });

    cachedSDK = new OrbitportSDK({
      config: {
        apiUrl: apiUrl ?? "https://op.spacecomputer.io",
        authDomain: authDomain ?? "auth.spacecomputer.io",
        clientId,
        clientSecret,
      },
      storage,
    });
    cachedSDK.setDebug(true);
    return cachedSDK;
  }

  // Credential-less mode: SDK routes through IPFS beacon automatically
  return new OrbitportSDK({ config: {} });
}

export function getMode(): "api-or-ipfs" | "ipfs-only" {
  const clientId = process.env.ORBITPORT_CLIENT_ID;
  const clientSecret = process.env.ORBITPORT_CLIENT_SECRET;
  return clientId && clientSecret ? "api-or-ipfs" : "ipfs-only";
}
