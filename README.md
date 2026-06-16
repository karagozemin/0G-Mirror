# 0G Mirror

**Verifiable Decision Trails for AI Agents**

0G Mirror records, stores, replays, and attests AI-agent decisions on 0G, so anyone can verify why an agent acted and whether the decision is consistent with its evidence.

## Problem

AI agents are starting to make decisions with real money, user trust, and operational consequences. Today, users cannot reliably prove what input/context an agent used, which model/config/tool path produced the decision, whether evidence can reproduce a similar decision, or whether the decision omitted critical facts.

## Solution

0G Mirror creates a **Decision Trace** for every agent decision:

- Task input and public context
- Evidence used
- Model/provider/config metadata
- Selected tools
- Agent output and short public rationale
- Input/output/decision hashes
- 0G Storage URI/root
- Replay verification result
- 0G Chain attestation

**0G Mirror does not claim to expose private model chain-of-thought. It records a verifiable decision trail: inputs, evidence, model config, tool usage, public rationale, output, hashes, replay status, and on-chain attestation.**

## Why 0G Is Core

0G is not a logo integration in this MVP:

- **0G Storage** stores Decision Trace JSON and Court Verdict JSON using the official `@0glabs/0g-ts-sdk` package.
- **0G Chain** stores trace hashes, storage URIs, storage roots, verification status, and court verdict attestations in `MirrorRegistry.sol`.
- **Replay verification** makes the stored trace useful: Verified, Inconsistent, or Missing Evidence.

If credentials are missing, the UI clearly shows:

> Local demo mode — connect 0G credentials for real storage.

## Architecture

```txt
User
  |
  v
Next.js App Router
  |
  +--> Deterministic AI Agent Adapter
  |      - Aegis: cautious DeFi risk analyst
  |      - Nyx: aggressive yield strategist
  |      - Hermes: fast execution agent
  |
  +--> Decision Trace Generator
  |      - Zod schema validation
  |      - Stable JSON hashing
  |      - Public rationale only
  |
  +--> 0G Storage Adapter
  |      - uploadJsonTo0G(data)
  |      - downloadJsonFrom0G(uri)
  |
  +--> 0G Chain Adapter
  |      - MirrorRegistry.registerDecisionTrace
  |      - MirrorRegistry.updateVerificationStatus
  |      - MirrorRegistry.registerCourtVerdict
  |
  +--> Verifier / Olympus Judge
         - Replay deterministic scoring
         - Produce Verified / Inconsistent / Missing Evidence
         - Produce Court Verdict JSON
```

## Repository

```txt
apps/web        Next.js app, UI, schemas, AI adapters, 0G adapters
contracts       Hardhat project and MirrorRegistry.sol
README.md       Project overview
DEMO.md         90-second demo script
SUBMISSION.md   Submission-ready description
```

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful commands:

```bash
npm run compile
npm run test
npm run build
```

## Configure 0G Storage

Copy `.env.example` to `.env` and set:

```env
0G_STORAGE_RPC=https://evmrpc-testnet.0g.ai
0G_STORAGE_INDEXER=https://indexer-storage-testnet-turbo.0g.ai
0G_STORAGE_PRIVATE_KEY=your_private_key_with_testnet_0g
```

The implementation follows the official 0G Storage TypeScript SDK flow:

- Create a `MemData` payload from JSON bytes
- Compute `merkleTree()` and root hash
- Create `Indexer(indexerRpc)`
- Upload with `indexer.upload(file, evmRpc, signer)`

## Deploy Contract

Set chain values in `.env`:

```env
NEXT_PUBLIC_0G_CHAIN_RPC=https://evmrpc-testnet.0g.ai
NEXT_PUBLIC_0G_CHAIN_ID=16602
PRIVATE_KEY=your_private_key_with_testnet_0g
```

Compile and deploy:

```bash
npm run compile
npm run deploy:0g
```

Then copy the deployed address:

```env
NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS=0x...
```

The Hardhat config uses `evmVersion: "cancun"` for 0G Chain compatibility.

## Demo Walkthrough

1. Open `/`.
2. Launch Mirror Core.
3. Choose `Aegis` and `DeFi Vault Risk Decision`.
4. Run decision.
5. Inspect the Decision Trace.
6. Store on 0G.
7. Register on-chain.
8. Verify Decision.
9. Enter Olympus Arena.
10. Start Aegis vs Nyx.
11. Verify Both.
12. Appeal to Olympus.
13. Show Court Verdict Card with storage URI and attestation ID.

## Limitations

- The default agents are deterministic local adapters so judges can demo without paid API keys.
- Real LLM/provider adapters can be added behind the same trace schema.
- Without 0G credentials, storage and chain actions run in clearly labeled local demo mode.
- Access control is intentionally minimal for hackathon clarity; production deployments should add verifier roles or policy controls.

## Future Roadmap

- Optional LLM adapters with provider/model config capture
- Multi-agent trace search over 0G-stored history
- Verifier role management
- Browser wallet flow for user-submitted attestations
- Trace reputation graph for future agents
- Public explorer for verified decision trails

## Official 0G References Checked

- 0G Storage SDK: https://docs.0g.ai/developer-hub/building-on-0g/storage/sdk
- Deploy contracts on 0G Chain: https://docs.0g.ai/developer-hub/building-on-0g/contracts-on-0g/deploy-contracts
- 0G AI coding context and Galileo network values: https://docs.0g.ai/ai-context
