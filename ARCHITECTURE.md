# 0G Mirror Architecture

0G Mirror is a verifiable decision trail system for AI agents. The design principle is simple: every consequential decision should become a structured artifact that can be stored, replayed, and attested.

## System Overview

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

## Core Data Model

### Decision Trace

The Decision Trace schema is defined in [apps/web/lib/schemas/decision-trace.ts](apps/web/lib/schemas/decision-trace.ts#L18).

It captures:

- schema version
- trace ID
- agent identity and version
- task input and public context
- model provider, model name, temperature, and optional seed
- tools used
- decision label, output, and public rationale
- evidence items
- input, output, and decision hashes
- verification status and replay result
- optional storage metadata
- optional attestation metadata
- creation timestamp

### Court Verdict

The Court Verdict schema is defined in [apps/web/lib/schemas/court-verdict.ts](apps/web/lib/schemas/court-verdict.ts#L1).

It captures:

- schema version
- case title
- trace references for both contestants
- the claim under review
- judge identity and version
- verdict winner and summary
- reason codes
- evidence coverage
- verification status for both traces
- verdict hash
- optional storage metadata
- optional attestation metadata
- creation timestamp

## Deterministic Agent Layer

The deterministic agent layer lives in [apps/web/lib/ai/agent.ts](apps/web/lib/ai/agent.ts#L1).

It defines three agents:

- Aegis: cautious DeFi risk analyst
- Nyx: aggressive yield strategist
- Hermes: fast execution agent

It also defines three tasks:

- DeFi Vault Risk Decision
- Grant Allocation Decision
- Smart Contract Exploit Triage

The layer works by:

- selecting evidence for the chosen agent and task
- scoring risk and opportunity from public evidence
- deriving an expected decision label
- generating a public rationale and decision output
- computing stable hashes for input, output, and decision

This layer is intentionally deterministic so the same public evidence produces the same replay result.

## Replay Verification

Replay verification is defined in [apps/web/lib/ai/verifier.ts](apps/web/lib/ai/verifier.ts#L12).

The verifier:

- resolves the agent and task from the stored trace
- checks whether any required evidence is missing
- recomputes the expected decision label from the public evidence
- marks the trace as:
  - Verified
  - Inconsistent
  - MissingEvidence

This is the central trust mechanism in the MVP.

## Olympus Judge

The Olympus Judge is defined in [apps/web/lib/ai/judge.ts](apps/web/lib/ai/judge.ts#L23).

It compares two Decision Traces by:

- measuring evidence coverage
- giving extra weight to Verified traces
- producing a winner and loser
- generating a verdict summary and reason codes
- hashing the final verdict draft into a stable verdict root

The resulting Court Verdict becomes another auditable artifact instead of a subjective UI label.

## Storage Layer

The 0G Storage adapter lives in [apps/web/lib/0g/storage.ts](apps/web/lib/0g/storage.ts#L1).

It:

- reads 0G Storage configuration from environment variables
- serializes JSON payloads as bytes
- computes a merkle root with the official 0G Storage SDK
- uploads the payload through the indexer
- returns a 0g URI, root hash, and optional tx hash
- downloads payloads back by URI when needed

If storage credentials are missing, the application falls back to local demo mode so the UI still works for judging.

## Chain Layer

The 0G Chain adapter lives in [apps/web/lib/0g/chain.ts](apps/web/lib/0g/chain.ts#L16).

It:

- connects to the configured 0G Chain RPC
- signs with the configured private key
- registers decision traces on chain
- updates verification status on chain
- registers court verdicts on chain
- extracts emitted IDs from transaction receipts

The adapter uses the ABI defined in [apps/web/lib/contracts/MirrorRegistry.ts](apps/web/lib/contracts/MirrorRegistry.ts#L1).

## Smart Contract

The on-chain source of truth is [contracts/contracts/MirrorRegistry.sol](contracts/contracts/MirrorRegistry.sol#L4).

It stores:

- decision trace count
- court verdict count
- a mapping of trace IDs to decision trace records
- a mapping of verdict IDs to verdict records

It emits three events:

- DecisionTraceRegistered
- VerificationStatusUpdated
- CourtVerdictRegistered

It also enforces basic validity checks:

- non-empty trace URI
- non-empty verdict URI
- non-zero decision hash
- valid trace IDs
- valid winning trace ID

## API Surface

The web app exposes five server routes:

- [apps/web/app/api/storage/upload/route.ts](apps/web/app/api/storage/upload/route.ts)
- [apps/web/app/api/storage/download/route.ts](apps/web/app/api/storage/download/route.ts)
- [apps/web/app/api/chain/register-trace/route.ts](apps/web/app/api/chain/register-trace/route.ts)
- [apps/web/app/api/chain/update-status/route.ts](apps/web/app/api/chain/update-status/route.ts)
- [apps/web/app/api/chain/register-verdict/route.ts](apps/web/app/api/chain/register-verdict/route.ts)

Each route returns a clean JSON response and falls back to a local-demo error path when credentials are missing.

## Front End Surfaces

- [apps/web/components/landing/LandingPage.tsx](apps/web/components/landing/LandingPage.tsx) is the marketing and entry surface.
- [apps/web/components/mirror/MirrorClient.tsx](apps/web/components/mirror/MirrorClient.tsx) creates, stores, registers, and verifies a single trace.
- [apps/web/components/mirror/VerifyClient.tsx](apps/web/components/mirror/VerifyClient.tsx) replays a stored trace.
- [apps/web/components/arena/ArenaClient.tsx](apps/web/components/arena/ArenaClient.tsx) runs the agent-vs-agent Olympus flow.
- [apps/web/components/shared/TraceCard.tsx](apps/web/components/shared/TraceCard.tsx) renders the proof object.

## Local Demo Mode

If 0G credentials are missing, the app uses clearly labeled local fallbacks for:

- storage URIs
- storage roots
- trace attestations
- verdict attestations

This keeps the demo usable without pretending the system has live infrastructure when it does not.

## Environment Requirements

### Web App

- NEXT_PUBLIC_0G_CHAIN_RPC
- NEXT_PUBLIC_0G_CHAIN_ID
- NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS
- PRIVATE_KEY
- 0G_STORAGE_RPC
- 0G_STORAGE_INDEXER
- 0G_STORAGE_PRIVATE_KEY

### Contract Tooling

The contract workspace uses Hardhat with:

- Solidity 0.8.24
- Cancun EVM target
- optimizer enabled
- 0G network presets for Galileo/testnet deployment

## Why This Design Works

- The trace schema is explicit and versioned.
- Replay is deterministic, so verification is explainable.
- 0G Storage and 0G Chain are used as real infrastructure, not decorative branding.
- The contract keeps the on-chain state small and auditable.
- The UI makes the proof path understandable to judges in a few clicks.

## Current MVP Boundary

The current MVP proves a decision trail end to end. It does not claim to be a full verifiable-compute platform yet.

- The deterministic replay verifier is the current truth engine.
- The data and attestation layers are real and live.
- The agent behavior is deterministic by design for repeatability in a judging environment.
- Future verifiable execution systems can plug into the same trace format without changing the product shape.

## Non-Goals

- Private chain-of-thought capture
- General-purpose agent orchestration
- Full production access-control policy
- Multitenant enterprise governance
