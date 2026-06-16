# Real 0G Proof

This file documents the judge-facing, verifiable proof artifact used in this repository. The canonical JSON proof is at [proofs/real-0g-proof.json](../proofs/real-0g-proof.json).

## Real proof (summary)

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

## What this proof shows

- A Decision Trace JSON payload was uploaded to 0G Storage (see the storage tx).
- The trace root / content-addressed URI and decision hash were registered on 0G Chain (register tx).
- The replay verifier recomputed the expected outcome from the public evidence and the on-chain status was updated to `Verified` (verification tx).
- The downloaded trace matches the recorded `decisionHash`.

## What this proof does not claim

- It does not reveal or store private model chain-of-thought.
- It does not assert production-grade oracle security.
- It does not claim fully decentralized verifiable-compute in the current MVP.

Note: the current MVP uses deterministic replay verification and is designed to plug into 0G Compute for verifiable execution in future work.

## How to reproduce (high level)

1. Install dependencies.
2. Copy `.env.example` to `.env.local` and populate 0G Chain / Storage and key values.
3. Run `npm run proof:real`.
4. Confirm `proofs/real-0g-proof.json` matches the table above.

## Verification pointers

- Storage: use the 0g:// URI to download the JSON and confirm `hashes.decisionHash` matches the Decision Hash above.
- Chain: inspect `MirrorRegistry` at the deployed address and confirm the stored `traceURI`, `traceRoot`, and `status`.

For a runnable walkthrough and script details see the repository's `proofs/real-0g-proof.json` and the proof helper scripts in `scripts/`.

