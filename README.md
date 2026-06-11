# Orbitport Playground

A developer playground for [SpaceComputer](https://spacecomputer.io) Orbitport.

Generate cosmic randomness, inspect response metadata, test deterministic examples, and copy integration snippets for your own app.

> **Developer demo.** Not for production cryptographic custody or wallet seed generation without a full security review.

---

## What Is This?

Orbitport Playground is an interactive web app that makes [SpaceComputer Orbitport](https://docs.spacecomputer.io) tangible for developers:

- Open the app → click **Generate** → get **cosmic randomness**
- Inspect the source, service, timestamp, and proof metadata
- Copy ready-to-use TypeScript/Next.js integration code
- Run deterministic raffle, dice, and NFT trait demos from the same random value
- Read from the public IPFS randomness beacon — no credentials needed

---

## What Is SpaceComputer cTRNG?

**cTRNG** (Cosmic True Random Number Generator) is SpaceComputer's satellite-backed entropy service. It harvests randomness from cosmic radiation detected by satellite hardware, making the output genuinely unbiased and externally verifiable.

Access is provided through the **Orbitport** API gateway and SDK.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 (App Router) | Framework, server routes |
| TypeScript | Type safety |
| Tailwind CSS | Styling base |
| `@spacecomputer-io/orbitport-sdk-ts` | Orbitport SDK |
| `lucide-react` | Icons |

---

## Setup

### Prerequisites

- Node.js 20+
- npm

### 1. Clone or download

```bash
cd "Orbitport Playground/orbitport-playground"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your credentials (optional — see below).

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ORBITPORT_CLIENT_ID` | Optional | Your Orbitport client ID |
| `ORBITPORT_CLIENT_SECRET` | Optional | Your Orbitport client secret |
| `ORBITPORT_API_URL` | Optional | Orbitport base URL (default: `https://op.spacecomputer.io`) |
| `ORBITPORT_AUTH_URL` | Optional | Auth0 URL for credentials (default provided) |

Get credentials at [accounts.spacecomputer.io](https://accounts.spacecomputer.io/).

---

## How Credential Mode Works

If `ORBITPORT_CLIENT_ID` and `ORBITPORT_CLIENT_SECRET` are both set in `.env.local`:

1. The backend initializes `OrbitportSDK` with full credentials.
2. The SDK authenticates via Auth0 OAuth2 client credentials flow.
3. The API fetches randomness from the full Orbitport API endpoint.
4. The response may include satellite cryptographic signature metadata.

The UI will show **API Mode** badge.

---

## How IPFS-Only Mode Works

If credentials are **not set**:

1. The backend initializes `OrbitportSDK` with an empty config: `new OrbitportSDK({ config: {} })`.
2. The SDK routes through the public SpaceComputer IPFS randomness beacon.
3. No authentication is required.

The UI will show **IPFS Beacon** badge and a note that no API signature is available in this mode.

The public beacon URL is:
```
https://ipfs.io/ipns/k2k4r8lvomw737sajfnpav0dpeernugnryng50uheyk1k39lursmn09f
```

It updates approximately every 60 seconds.

---

## How Deterministic Examples Work

The **Mini Examples** tab (dice, raffle, NFT traits) never generates new randomness independently.

They use the **last cosmic hex value** generated in the cTRNG tab.

Formula used for raffle:
```ts
const index = Number(BigInt("0x" + randomHex) % BigInt(participants.length));
const winner = participants[index];
```

This means: the same cosmic hex + same participant list → always the same winner. **Verifiable and reproducible.**

---

## Security Notes

- `ORBITPORT_CLIENT_SECRET` is **never** sent to the browser. All credential-based calls go through Next.js server API routes (`/api/ctrng/random`).
- The browser only ever calls your own backend at `/api/ctrng/random` or `/api/beacon/latest`.
- `Math.random()` is **never used** as a fallback for randomness. If the source fails, the app returns an explicit error.
- No signature verification is implemented in this demo — displayed metadata is for inspection only.

---

## Limitations

- This is a **developer demo** — not production-grade cryptographic infrastructure.
- The IPFS beacon response does not include the same API signature that a credentialed API call may provide.
- Signature verification is shown in the UI but **not cryptographically verified** in this app.
- IPFS gateways can be slow or temporarily unavailable. The beacon route tries 3 fallback gateways.
- The SDK response shape may vary between SDK versions. If `result.data.data` is missing, the API returns a `MISSING_RANDOM_DATA` error with the raw response for inspection.

---

## Future Roadmap

- [ ] KMS demo tab (key generation, sign/encrypt/decrypt)
- [ ] OrbitRaffle export card (shareable winner proof image)
- [ ] Historical IPFS beacon explorer
- [ ] Verification page (paste hex + participants → recalculate winner)
- [ ] Deploy to Vercel with one-click deploy button

---

## References

- [SpaceComputer Website](https://spacecomputer.io)
- [Orbitport Docs](https://docs.spacecomputer.io)
- [SDK Quickstart](https://docs.spacecomputer.io/docs/how-to/sdk-quickstart)
- [IPFS Beacon Docs](https://docs.spacecomputer.io/docs/how-to/ipfs-beacon)
- [SDK GitHub](https://github.com/spacecomputer-io/orbitport-sdk-ts)
- [Demo Repo](https://github.com/spacecomputer-io/spacecomputer-orbitport-demo)
- [Get API Credentials](https://accounts.spacecomputer.io/)
