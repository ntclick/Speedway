# Cosmic Speedway

Cosmic Speedway is a premium, high-fidelity, deterministic space racing game powered by [SpaceComputer](https://spacecomputer.io) Orbitport cTRNG (Cosmic True Random Number Generator) and KMS. 

Analyze randomized spaceship telemetry, place your wagers, and watch a weighted, provably fair space derby unfold on a widescreen neon cyberpunk racetrack.

---

## Key Features

- **Provably Fair Space Derby:** Race outcomes are determined on-chain/in-enclave by true cosmic randomness harvested from space radiation, rendering the game mathematically unbiased and externally verifiable.
- **Full-Width Widescreen Arena (`1200x600`):** Experience high-fidelity space racing on a scaled highway track featuring custom-drawn lane markers, checkered finish lines, and dynamic starfield drifts.
- **Holographic Spacecraft Chambers:** Interactive cockpit selection cards displaying floating 3D-feeling spacecraft holograms, neon mini spec-meters, and unique active auras matching their signature colors.
- **Cosmic Buffs & Hazards:** Races feature dynamically generated racetrack items. Spaceships surge forward with green sparks upon collecting power-ups (Quantum Packs, Warp Cores, Shield Cells) or lag behind with exhaust smoke upon striking obstacles (EMP Mines, Space Junk, Plasma Clouds) using decaying physics that preserve seed-based winners.
- **Dynamic Overtaking Wobbles:** Realistic sinusoidal overtaking maneuvers where ships swap leads dynamically during the race, converging precisely at the finish line according to the predetermined entropy seed.
- **Local Vocal Announcer:** Opt-in native browser `SpeechSynthesis` commentator calling out countdown status, leaders telemetry, and race results.
- **Cryptographic Attestation Proofs:** Developer verification tab showing SHA256 seed hashing formulas, satellite enclaves public key checks, and IPFS beacon signatures.

---

## How It Works (Deterministic Fairness)

Cosmic Speedway uses a hybrid cryptographic seed generation flow:
1. **Satellite cTRNG API:** Fetches true cosmic radiation entropy signed inside SpaceComputer's orbital hardware enclave.
2. **KMS & IPFS Fallback:** If the API falls back to the static 60s IPFS beacon, the system hashes the IPFS block with the KMS signature:
   $$\text{Seed} = \text{SHA256}(\text{IPFS\_Beacon} + \text{KMS\_Signature})$$
3. **Derived Winners:** The spaceship specifications and race velocities are derived deterministically using modulo math on slices of this seed. This guarantees that whoever holds the winning slice takes 1st place, making the race verifiable and reproducible.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16 (App Router)** | Web application framework and server routes |
| **React 19 & TypeScript** | Component rendering and type safety |
| **Motion** | Spring animations for cockpit wagers and holographic cards |
| **HTML5 Canvas (2D)** | 60 FPS gameplay, particle systems, and neon rendering |
| **`@spacecomputer-io/orbitport-sdk-ts`** | Satellite cTRNG & KMS API interface |

---

## Setup & Running Locally

### Prerequisites
- Node.js 20+
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy the example environment template:
```bash
cp .env.example .env.local
```
*(Optional)* Add your client credentials inside `.env.local` to enable official signature checks:
- `ORBITPORT_CLIENT_ID`
- `ORBITPORT_CLIENT_SECRET`

If left blank, the game runs in public **IPFS-Only Beacon Mode** automatically.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5669](http://localhost:5669) in your browser.

---

## Security & Verification

- **Secure Secrets:** API secrets are only handled server-side. The client calls safe server routes (`/api/ctrng/random` and `/api/beacon/latest`) to request randomness.
- **Anti-Manipulation:** The game uses zero client-side pseudo-randomness (`Math.random`) for physics or racing outcomes. Every movement, collision, and lead change is bound to the verifiable satellite payload.
