<p align="center">
  <img src="0G-Mirror.png" alt="0G Mirror — Verifiable Decision Trails for AI Agents" width="250" />
</p>

# 0G Mirror

**Verifiable decision trails for AI agents**

0G Mirror turns consequential AI-agent decisions into auditable proof objects. Each decision becomes a Decision Trace, is stored on 0G Storage, replay-verified against public evidence, and attested on 0G Chain through `MirrorRegistry`.

## Live Demo

https://0g-mirror.vercel.app/

## One-Line Pitch

0G Mirror is a verifiable decision trail layer for AI agents: it records what the agent saw, what it used, what it decided, and whether that decision can be replayed and trusted.

## Real 0G Proof

The project includes a verified end-to-end proof from Galileo testnet.

```txt
Chain ID: 16602
MirrorRegistry: 0x8c5C403994CC7a5A469bBF82904e504060109858
Trace ID: 1
Verification Status: Verified
Decision Hash: 0x7f1775e02212e8764cefc347a09df82aa33ebe05d377e2bb496fb9c2fe1da884
0G Storage URI: 0g://0xe58925c613298780175066ae3e2762e6154b152329a3b3c8b532716196ef4aee
0G Storage Tx: 0x109b3457bc7a0b0032b1d81bc773f8664c5dbaaa310adb46d73bdb7360757a03
Register Trace Tx: 0x439d5a8bca2bd17b051738d12124b90a0c5cb3ab5c1cc996a76e45137f3b23de
Verification Status Tx: 0x7061af685a1c61e3db2ee976034baad35da506b73464a737dace23027eae2515
```

## Why It Exists

AI agents are already making decisions with real money, trust, and operational consequences. The missing primitive is not another chatbot. The missing primitive is a public, replayable proof of how a decision was made.

0G Mirror fills that gap by turning each agent decision into a decision trail anyone can inspect.

## What It Does

- Records the task input, public context, evidence, model config, tools used, decision output, and public rationale.
- Hashes the trace deterministically so the same public inputs produce the same decision hash.
- Stores the trace JSON and court verdict JSON on 0G Storage.
- Registers trace roots, storage URIs, verification status, and verdict attestations on 0G Chain.
- Replays the decision path to classify the trace as Verified, Inconsistent, or Missing Evidence.
- Runs Olympus Arena, where two agents compete and a Court Verdict is produced from their traces.

## Product Surface

- Mirror Core: create a Decision Trace, store it, register it, and verify it.
- Verify page: reopen any stored trace and replay the public evidence.
- Olympus Arena: run two agents head-to-head and produce a verdict object from both traces.
- Proof layer: keep the real trace hash, storage URI, and chain txs visible for judging.

## Architecture Snapshot

```txt
User
  |
  v
Next.js App Router
  |
  +--> Deterministic Agent Layer
  |      - Aegis: cautious DeFi risk analyst
  |      - Nyx: aggressive yield strategist
  |      - Hermes: fast execution agent
  |
  +--> Decision Trace Layer
  |      - Zod schema validation
  |      - Stable JSON hashing
  |      - Public rationale only
  |
  +--> 0G Storage Adapter
  |      - uploadJsonTo0G(data)
  |      - downloadJsonFrom0G(uri)
  |
  +--> 0G Chain Adapter
  |      - registerDecisionTraceOnChain
  |      - updateVerificationStatusOnChain
  |      - registerCourtVerdictOnChain
  |
  +--> Replay Verifier
         - Deterministic evidence scoring
         - Verified / Inconsistent / Missing Evidence
         - Updates the stored trace verification status

Olympus Arena adds a second path on top of the same primitives:

User -> Two Agents -> Two Decision Traces -> Replay Verification -> Olympus Judge -> Court Verdict -> 0G Storage + 0G Chain
```

## Repository Map

See the technical architecture in [ARCHITECTURE.md](ARCHITECTURE.md).

If you want the full implementation reference, start there. The README is the product entry point; ARCHITECTURE.md is the technical source of truth.

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deployment and Proof

- `npm run compile` builds the smart contract project.
- `npm run deploy:0g` deploys `MirrorRegistry` to 0G Chain.
- `npm run proof:real` regenerates the real proof artifact after credentials are configured.

## Evidence To Show Judges

- The real proof block above.
- The live demo link above.
- The decision trace screen in Mirror Core.
- The replay verifier that marks traces as Verified, Inconsistent, or Missing Evidence.
- The Olympus Arena verdict card.

## Screenshots

![0G Mirror landing page](docs/screenshots/01-landing.png)

![Mirror Core Decision Trace](docs/screenshots/02-mirror-decision-trace.png)

![Mirror Core real 0G Storage URI](docs/screenshots/03-mirror-storage-uri.png)

![Mirror Core Verified replay status](docs/screenshots/04-mirror-verified.png)

![Olympus Arena Aegis vs Nyx](docs/screenshots/05-arena-aegis-vs-nyx.png)

![Olympus Court Verdict Card](docs/screenshots/06-olympus-verdict-card.png)

## Limitations

- The current MVP uses deterministic local agents and deterministic replay verification.
- The app does not expose private chain-of-thought.
- If 0G credentials are missing, the UI falls back to clearly labeled local demo mode.
- Production deployments should add stronger access control and policy layers.

## Why This Wins

- It uses 0G as real infrastructure, not as branding.
- It proves the full path: trace, storage, replay, and attestation.
- It includes a verified on-chain proof artifact instead of only screenshots.
- It gives judges a simple flow: inspect the trace, verify it, and trust the result.
