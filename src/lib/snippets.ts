/**
 * Code snippets for the Snippets tab.
 * These are static strings — no runtime secret exposure.
 */

export const SNIPPETS = {
  sdkWithCredentials: `import { OrbitportSDK } from "@spacecomputer-io/orbitport-sdk-ts";

const sdk = new OrbitportSDK({
  config: {
    baseUrl: process.env.ORBITPORT_API_URL ?? "https://op.spacecomputer.io",
    authUrl: process.env.ORBITPORT_AUTH_URL,
    clientId: process.env.ORBITPORT_CLIENT_ID,
    clientSecret: process.env.ORBITPORT_CLIENT_SECRET,
  },
});

const result = await sdk.ctrng.random();

console.log("Random hex:", result.data.data);
console.log("Source:", result.data.src);
console.log("Success:", result.success);`,

  sdkWithoutCredentials: `import { OrbitportSDK } from "@spacecomputer-io/orbitport-sdk-ts";

// No credentials — routes via public IPFS beacon
const sdk = new OrbitportSDK({ config: {} });

const result = await sdk.ctrng.random();

console.log("Random hex:", result.data.data);
console.log("Source:", result.data.src);`,

  nextjsApiRoute: `// app/api/ctrng/random/route.ts
import { NextResponse } from "next/server";
import { OrbitportSDK } from "@spacecomputer-io/orbitport-sdk-ts";

export async function GET() {
  const sdk = new OrbitportSDK({
    config: {
      baseUrl: process.env.ORBITPORT_API_URL ?? "https://op.spacecomputer.io",
      authUrl: process.env.ORBITPORT_AUTH_URL,
      clientId: process.env.ORBITPORT_CLIENT_ID,
      clientSecret: process.env.ORBITPORT_CLIENT_SECRET,
    },
  });

  try {
    const result = await sdk.ctrng.random();
    return NextResponse.json({ success: true, result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}`,

  clientFetch: `// Browser-safe — calls your own backend, never touches secrets
const response = await fetch("/api/ctrng/random");
const json = await response.json();

if (json.success) {
  const randomHex = json.result.data.data;
  console.log("Cosmic random:", randomHex);
} else {
  console.error("Error:", json.error);
}`,

  curlBeacon: `# Fetch the public IPFS randomness beacon — no auth required
curl https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f`,

  deterministicRaffle: `function pickWinner(randomHex: string, participants: string[]) {
  if (participants.length === 0) throw new Error("No participants");

  const normalized = randomHex.startsWith("0x")
    ? randomHex
    : \`0x\${randomHex}\`;

  const randomBigInt = BigInt(normalized);
  const index = Number(randomBigInt % BigInt(participants.length));

  return {
    index,
    winner: participants[index],
    formula: \`BigInt("0x...") % \${participants.length}n = \${index}\`,
  };
}

// Usage:
const result = pickWinner(cosmicHex, ["Alice", "Bob", "Carol"]);
console.log(\`Winner: \${result.winner} (index \${result.index})\`);`,
};
