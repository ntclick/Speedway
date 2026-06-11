import { NextResponse } from "next/server";
import { normalizeOrbitportError } from "@/lib/errors";

export const runtime = "nodejs";

const IPFS_BEACON_URL =
  "https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f";

const FALLBACK_GATEWAYS = [
  "https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
  "https://cloudflare-ipfs.com/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
  "https://dweb.link/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f",
];

export async function GET() {
  let lastError: unknown = null;

  for (const gateway of FALLBACK_GATEWAYS) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(gateway, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });

      clearTimeout(timeout);

      if (!response.ok) {
        lastError = new Error(`Gateway ${gateway} returned ${response.status}`);
        continue;
      }

      const contentType = response.headers.get("content-type") ?? "";
      let data: unknown;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          // Return raw text as-is
          data = { raw_text: text };
        }
      }

      return NextResponse.json({
        success: true,
        gateway,
        beaconUrl: IPFS_BEACON_URL,
        fetchedAt: new Date().toISOString(),
        data,
      });
    } catch (err: unknown) {
      lastError = err;
      continue;
    }
  }

  return NextResponse.json(
    {
      success: false,
      beaconUrl: IPFS_BEACON_URL,
      error: normalizeOrbitportError(lastError),
    },
    { status: 502 }
  );
}
