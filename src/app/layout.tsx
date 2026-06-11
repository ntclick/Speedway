import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cosmic Speedway — Space Derby cTRNG Developer Lab",
  description:
    "Test SpaceComputer Orbitport cTRNG with Cosmic Speedway, a deterministic space racing game. Inspect signature proofs, verify enclave entropy, and review SDK code.",
  keywords: [
    "SpaceComputer",
    "Orbitport",
    "cTRNG",
    "cosmic randomness",
    "IPFS beacon",
    "true random number generator",
    "satellite randomness",
    "Web3 randomness",
    "space racing game",
    "developer playground",
  ],
  openGraph: {
    title: "Cosmic Speedway — Space Derby cTRNG Developer Lab",
    description:
      "Generate cosmic randomness from SpaceComputer Orbitport in Cosmic Speedway. A developer playground for cTRNG and IPFS beacon.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="stars" aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
      </body>
    </html>
  );
}
