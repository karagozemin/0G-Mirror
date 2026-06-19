# 0G Mirror

<p align="center">
  <img src="./apps/web/public/0g-mirror-logo.png" alt="0G Mirror logo" width="250" />
</p>

**Verification infrastructure for AI-agent decisions on 0G**

[Live Demo](https://0g-mirror.vercel.app/) · [GitHub](https://github.com/karagozemin/0g-mirror) · [Architecture](./docs/ARCHITECTURE.md) · [Proof](#3-live-0g-proof) · [Demo Flow](#demo-flow)

---

## Judge TL;DR

- 0G Mirror makes AI-agent decisions auditable.
- Users authorize exact traces with wallet signatures.
- Signed traces are uploaded to 0G Storage.
- Users sign on-chain attestations through MirrorRegistry.
- Olympus Arena is the showcase, not a separate product.

---

## 1. What is 0G Mirror?

0G Mirror is the **verification layer** for AI-agent decisions — not another agent app.

It produces a **Decision Trace**: a structured proof artifact with task input, public context, evidence trail, model metadata, agent output, **public rationale**, content hashes, 0G Storage URI/root, replay verification result, and on-chain attestation.

It records **public rationale and evidence** — not private model chain-of-thought.

## 2. Why does it matter?

Agents are starting to act with real money and real consequences. Without a proof layer, no one can answer:

- What evidence did the agent use?
- Which model/config/tool path produced the output?
- Was the stored artifact modified after authorization?
- Does the decision replay consistently against its public evidence?

0G Mirror turns those questions into a verifiable trail on 0G Storage and 0G Chain.

> **0G Mirror is not another AI agent app. It is the verification layer that makes agent decisions auditable on 0G.**

## 3. Live 0G Proof

Real end-to-end proof on **0G Galileo** — not a mock:

| Item | Value |
| --- | --- |
| Chain ID | `16602` |
| MirrorRegistry | [`0x8c5C403994CC7a5A469bBF82904e504060109858`](https://chainscan-galileo.0g.ai/address/0x8c5C403994CC7a5A469bBF82904e504060109858) |
| Trace ID / Status | `1` / `Verified` |
| Decision Hash | `0x7f1775e02212e8764cefc347a09df82aa33ebe05d377e2bb496fb9c2fe1da884` |
| 0G Storage URI | [`0g://0xe58925c6…ef4aee`](https://storagescan-galileo.0g.ai/search?q=0xe58925c613298780175066ae3e2762e6154b152329a3b3c8b532716196ef4aee) |
| Storage Tx | [`0x109b3457…0757a03`](https://chainscan-galileo.0g.ai/tx/0x109b3457bc7a0b0032b1d81bc773f8664c5dbaaa310adb46d73bdb7360757a03) |
| Register Tx | [`0x439d5a8b…3b23de`](https://chainscan-galileo.0g.ai/tx/0x439d5a8bca2bd17b051738d12124b90a0c5cb3ab5c1cc996a76e45137f3b23de) |
| Verify Tx | [`0x7061af68…ae2515`](https://chainscan-galileo.0g.ai/tx/0x7061af685a1c61e3db2ee976034baad35da506b73464a737dace23027eae2515) |

Artifacts: `proofs/real-0g-proof.json` · `proofs/downloaded-real-trace.json`

## 4. Proof Flow

Two wallet actions. One honest storage operator. User wallet is always the on-chain authority.

```txt
Agent produces Decision Trace
        │
User signs EIP-712 StorageUploadIntent (exact artifact hash)
        │
Storage operator uploads the signed artifact to 0G Storage
        │
User wallet signs registerDecisionTrace on MirrorRegistry
        │
Replay verifier checks public evidence → user wallet signs updateVerificationStatus
```

| Step | Who signs | What happens |
| --- | --- | --- |
| Storage upload | User wallet (EIP-712) | Authorizes the exact artifact; operator uploads server-side for reliability |
| Chain attestation | User wallet (tx) | Registers hash, URI, root; updates verification status |
| Replay | Verifier (deterministic) | Checks consistency with public evidence — not 0G Compute (future) |

The storage operator cannot mutate the artifact without breaking the signed hash. It cannot sign on-chain writes.

## 5. Full Architecture

**[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — trust model, 5 Mermaid diagrams, schemas, storage operator role, MirrorRegistry, replay verification, MVP vs future work.

---

## Olympus Arena

Showcase mode: two agents (Aegis vs Nyx) produce Decision Traces on the same challenge, both are replay-verified, and an Olympus Judge emits a Court Verdict through the same wallet-authorized storage + wallet-signed attestation flow.

## 0G Stack

| Layer | Role in 0G Mirror |
| --- | --- |
| **0G Storage** | Content-addressed artifact storage (Decision Trace, Court Verdict JSON) |
| **0G Chain** | Compact attestations via `MirrorRegistry` (hash, root, URI, status, events) |
| **0G Compute** | Future — verifiable execution; current MVP uses deterministic replay |

## Limitations

- Deterministic replay against submitted public evidence — not external ground truth.
- No private chain-of-thought — public rationale and evidence trail only.
- Storage upload is user-authorized but server-executed (reliability tradeoff).
- Galileo testnet; minimal access control (MVP scope).

## Run Locally

```bash
npm install && npm run dev          # http://localhost:3000
npm run compile && npm run test     # contracts
npm run typecheck --workspace apps/web && npm run build
```

```bash
cp .env.example .env.local
```

Client: `NEXT_PUBLIC_0G_CHAIN_RPC`, `NEXT_PUBLIC_0G_CHAIN_ID`, `NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

Server (storage operator only): `OG_STORAGE_RPC`, `OG_STORAGE_INDEXER`, `OG_STORAGE_PRIVATE_KEY`

## Demo Flow

1. Landing page → **Live 0G Proof** table above.
2. Mirror Core → generate Decision Trace → show evidence, public rationale, decision hash.
3. Sign storage upload authorization → artifact on 0G Storage.
4. Sign on-chain attestation → register on `MirrorRegistry`.
5. Replay verify → `Verified` on-chain.
6. Olympus Arena → Aegis vs Nyx → Court Verdict Card.

## Repository

```txt
apps/web        Next.js UI, agents, verifier, wallet pipeline, 0G integration
contracts       MirrorRegistry.sol + Hardhat tests
proofs          real 0G proof artifacts
docs/           architecture documentation
```
