import type { CTRNGResponse, ServiceResult } from "@spacecomputer-io/orbitport-sdk-ts";

/**
 * Parse and normalize Orbitport SDK ServiceResult<CTRNGResponse>.
 *
 * SDK types confirmed:
 *   result.data.data   -> hex string (the random value)
 *   result.data.src    -> source: 'trng' | 'rng' | 'ipfs'
 *   result.data.service -> service name
 *   result.data.signature -> optional { value, pk, algo? }
 *   result.data.timestamp -> optional ISO string
 *   result.data.provider  -> optional
 *   result.metadata.request_id -> optional
 *   result.metadata.timestamp  -> unix timestamp
 */
export type ParsedRandom = {
  randomHex: string;
  source?: string;
  service?: string;
  timestamp?: string;
  requestId?: string;
  provider?: string;
  signature?: {
    value?: string;
    pk?: string;
    algo?: string;
  };
  ctrngVerified?: boolean;
  ctrngVerificationError?: string;
  raw: unknown;
};

export function parseRandomResult(result: ServiceResult<CTRNGResponse>): ParsedRandom {
  const ctrng = result.data;

  if (!ctrng?.data || typeof ctrng.data !== "string") {
    throw new Error(
      "Response did not contain expected random hex at result.data.data. Raw: " +
        JSON.stringify(result)
    );
  }

  return {
    randomHex: ctrng.data,
    source: ctrng.src ?? undefined,
    service: ctrng.service ?? undefined,
    timestamp:
      ctrng.timestamp ??
      (result.metadata?.timestamp
        ? new Date(result.metadata.timestamp).toISOString()
        : new Date().toISOString()),
    requestId: result.metadata?.request_id ?? undefined,
    provider: ctrng.provider ?? undefined,
    signature: ctrng.signature
      ? {
          value: ctrng.signature.value,
          pk: ctrng.signature.pk,
          algo: ctrng.signature.algo,
        }
      : undefined,
    ctrngVerified: (result as any).ctrngVerified ?? undefined,
    ctrngVerificationError: (result as any).ctrngVerificationError ?? undefined,
    raw: result,
  };
}
