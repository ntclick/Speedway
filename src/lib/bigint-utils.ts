/**
 * BigInt utilities for deterministic examples from cosmic random hex.
 * All functions accept hex strings with or without 0x prefix.
 */

export function normalizeHex(hex: string): `0x${string}` {
  if (!hex || typeof hex !== "string") throw new Error("Missing or invalid hex");
  const clean = hex.trim();
  return clean.startsWith("0x")
    ? (clean as `0x${string}`)
    : (`0x${clean}` as `0x${string}`);
}

export function randomHexToBigInt(hex: string): bigint {
  return BigInt(normalizeHex(hex));
}

export function pickIndexFromRandom(hex: string, length: number): number {
  if (!Number.isInteger(length) || length <= 0) {
    throw new Error("Length must be a positive integer");
  }
  return Number(randomHexToBigInt(hex) % BigInt(length));
}

export function diceRollFromRandom(hex: string, sides = 6): number {
  if (!Number.isInteger(sides) || sides < 2) {
    throw new Error("Sides must be an integer >= 2");
  }
  return Number(randomHexToBigInt(hex) % BigInt(sides)) + 1;
}

export function pickItemFromRandom<T>(hex: string, items: T[]): T {
  if (items.length === 0) throw new Error("Items array must not be empty");
  const index = pickIndexFromRandom(hex, items.length);
  return items[index];
}

export function hexToPercent(hex: string): number {
  const n = randomHexToBigInt(hex);
  const max = BigInt("0x" + "ff".repeat(32));
  return Number((n * BigInt(10000)) / max) / 100;
}
