# 0G Mirror

<p align="center">
    <img src="apps/web/public/0g-mirror-logo.png" alt="0G Mirror logo" width="200" />
</p>

Verifiable Decision Trails for AI Agents

[Live Demo](https://0g-mirror.vercel.app/) · [GitHub Repo](https://github.com/karagozemin/0g-mirror) · [Architecture](./docs/ARCHITECTURE.md) · [Real 0G Proof](./docs/PROOF.md) · [Demo Flow](./docs/DEMO_FLOW.md)

---

What 0G Mirror does in one line: capture agent decisions as auditable, content-addressed Decision Traces and attest them on-chain.

## Live 0G Proof

| Item | Value |
| --- | --- |
| **Chain ID** | 16602 |
| **MirrorRegistry** | 0x8c5C403994CC7a5A469bBF82904e504060109858 |
| **Trace ID** | 1 |
| **Verification Status** | Verified |
| **Decision Hash** | 0x7f1775e02212e8764cefc347a09df82aa33ebe05d377e2bb496fb9c2fe1da884 |
| **0G Storage URI** | 0g://0xe58925c613298780175066ae3e2762e6154b152329a3b3c8b532716196ef4aee |
| **0G Storage Tx** | 0x109b3457bc7a0b0032b1d81bc773f8664c5dbaaa310adb46d73bdb7360757a03 |
| **Register Trace Tx** | 0x439d5a8bca2bd17b051738d12124b90a0c5cb3ab5c1cc996a76e45137f3b23de |
| **Verification Status Tx** | 0x7061af685a1c61e3db2ee976034baad35da506b73464a737dace23027eae2515 |

Short explanation: this shows a Decision Trace was uploaded to 0G Storage (storage tx), the trace root/hash were registered on 0G Chain (register tx), and the verifier attested a `Verified` status on-chain (verification tx). See [docs/PROOF.md](./docs/PROOF.md) for the full artifact and reproducibility steps.

---

## What is 0G Mirror?

0G Mirror turns AI-agent decisions into public, auditable Decision Traces. Each trace captures inputs, public evidence, model metadata, tool usage, a public rationale, stable hashes, and a verification status. Traces are stored in 0G Storage and attested by MirrorRegistry on 0G Chain.

The current MVP uses deterministic replay verification and is designed to plug into 0G Compute for verifiable execution.

## Why it matters

Protocols and users need verifiable records of consequential agent actions — not hidden reasoning. 0G Mirror provides a minimal, auditable evidence trail so third parties can reproduce and assess decisions without accessing private chain-of-thought.

## How it works (4 steps)

1. Decision Capture — deterministic agent emits a versioned Decision Trace (inputs, evidence, public rationale, model metadata).
2. Content Hashing — trace is normalized and hashed to create stable roots and decision hashes.
3. Storage & Attestation — trace JSON uploaded to 0G Storage (0g:// URI) and the root/hash registered on 0G Chain via `MirrorRegistry`.
4. Replay Verification — verifier deterministically replays the decision using the public evidence and updates on-chain status (Verified/Inconsistent/MissingEvidence).

## Olympus Arena (showcase)

Olympus Arena is a demo mode that runs two deterministic agents on the same challenge, compares their evidence coverage and replay results, and emits a content-addressed Court Verdict. It is a showcase built on top of 0G Mirror — not a separate project.

## Mini architecture (quick)

0G Mirror is a three-layer verification system:

1. **Decision Layer** — deterministic agents produce structured Decision Traces.
2. **Proof Layer** — traces are uploaded to 0G Storage and registered on 0G Chain via `MirrorRegistry`.
3. **Verification Layer** — deterministic replay verification checks trace consistency and updates the on-chain status.

Full technical breakdown: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

## Tech stack

- Next.js (App Router) · React · TailwindCSS
- TypeScript · Solidity
- Hardhat · ethers.js
- Zod for schemas
- 0G Storage SDK · 0G Chain (Galileo testnet)

## Run locally

Install and run the web app:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

Build / verify:

```bash
npm run compile
npm run test
npm run typecheck --workspace apps/web
npm run build
```

## Environment variables

Copy the example file to `.env.local` at the repository root and populate the values. `.env.local` contains sensitive private keys, is local-only, and is ignored by git. Do not commit it.

```bash
cp .env.example .env.local
```

Recommended variables (examples):

- `NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS` (deployed address)
- `NEXT_PUBLIC_0G_CHAIN_RPC` (RPC endpoint)
- `NEXT_PUBLIC_0G_CHAIN_ID` (e.g. 16602)
- `PRIVATE_KEY` (local test key)
- `0G_STORAGE_RPC`, `0G_STORAGE_INDEXER`, `0G_STORAGE_PRIVATE_KEY`

When credentials are missing the app falls back to a clearly labeled local demo mode.

## Smart contract

`MirrorRegistry` (see `contracts/contracts/MirrorRegistry.sol`) is intentionally minimal and gas-efficient: it records hashes, creators, status, and URIs as on-chain attestations. Large decision artifacts and full trace JSONs remain off-chain in 0G Storage.

## Demo flow

See the 90-second judge script: [docs/DEMO_FLOW.md](./docs/DEMO_FLOW.md)

## Limitations

- Deterministic replay verification (current MVP).
- No private chain-of-thought is stored or exposed.
- Minimal access control for hackathon simplicity.
- Not yet a production verifiable-compute deployment.

## Roadmap

- 0G Compute integration for verifiable execution
- Browser wallet flow (MetaMask/Rabby)
- Public Trace Explorer
- Multi-agent decision graphs and verifier roles



