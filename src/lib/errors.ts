/**
 * Error normalization for Orbitport SDK errors.
 * Returns structured, human-readable error objects for the API response.
 */

export type NormalizedError = {
  code: string;
  message: string;
  hint?: string;
  raw?: unknown;
};

export function normalizeOrbitportError(error: unknown): NormalizedError {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    if (msg.includes("401") || msg.includes("unauthorized") || msg.includes("authentication")) {
      return {
        code: "AUTH_FAILED",
        message: "Orbitport API authentication failed.",
        hint:
          "Check that ORBITPORT_CLIENT_ID and ORBITPORT_CLIENT_SECRET are correct. Visit https://accounts.spacecomputer.io/ to get credentials.",
        raw: error.message,
      };
    }

    if (msg.includes("403") || msg.includes("forbidden")) {
      return {
        code: "FORBIDDEN",
        message: "Access denied by Orbitport API.",
        hint: "Your credentials may not have permission for this endpoint.",
        raw: error.message,
      };
    }

    if (
      msg.includes("econnrefused") ||
      msg.includes("fetch failed") ||
      msg.includes("network") ||
      msg.includes("etimedout") ||
      msg.includes("timeout")
    ) {
      return {
        code: "NETWORK_ERROR",
        message: "Could not reach Orbitport or IPFS gateway.",
        hint:
          "Check your internet connection. The IPFS beacon may be temporarily unreachable.",
        raw: error.message,
      };
    }

    if (msg.includes("ipfs") || msg.includes("gateway")) {
      return {
        code: "IPFS_ERROR",
        message: "IPFS beacon fetch failed.",
        hint:
          "The public IPFS gateway may be congested. Try again in a few seconds.",
        raw: error.message,
      };
    }

    return {
      code: "SDK_ERROR",
      message: error.message || "An unknown SDK error occurred.",
      raw: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred.",
    raw: String(error),
  };
}

export const ERROR_CATALOG = [
  {
    code: "MISSING_CREDENTIALS",
    title: "No API credentials found",
    description:
      'ORBITPORT_CLIENT_ID and/or ORBITPORT_CLIENT_SECRET are not set. The app is running in IPFS-only mode using the public beacon.',
    hint: "Set credentials in .env.local to enable full API access.",
    severity: "info" as const,
  },
  {
    code: "AUTH_FAILED",
    title: "Authentication failed",
    description:
      "Orbitport API rejected the credentials. The clientId or clientSecret may be incorrect.",
    hint:
      'Visit https://accounts.spacecomputer.io/ to verify your credentials.',
    severity: "error" as const,
  },
  {
    code: "NETWORK_ERROR",
    title: "Network unreachable",
    description: "Could not connect to Orbitport or IPFS gateway.",
    hint: "Check internet connection. Retry in a few seconds.",
    severity: "error" as const,
  },
  {
    code: "MISSING_RANDOM_DATA",
    title: "No random data in response",
    description:
      'The API responded but result.data.data was missing or empty.',
    hint: "This may indicate an API version mismatch. Check SDK version.",
    severity: "error" as const,
  },
  {
    code: "IPFS_ERROR",
    title: "IPFS beacon unavailable",
    description: "The public IPFS randomness beacon could not be fetched.",
    hint: "Try again — IPFS gateways can be temporarily slow.",
    severity: "warning" as const,
  },
  {
    code: "SDK_ERROR",
    title: "SDK error",
    description: "The Orbitport SDK threw an unexpected error.",
    hint: "Check the raw error output for more details.",
    severity: "error" as const,
  },
];
