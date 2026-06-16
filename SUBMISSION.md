# Project name

0G Mirror

# Short description

0G Mirror is a verifiable decision layer for AI agents. It records decision traces, stores them on 0G, verifies them through replay, and attests the result on-chain.

# Long description

0G Mirror solves a core trust problem for AI agents: when an agent makes a consequential decision, users need proof of what input/context was used, which evidence was considered, what model/config/tool path produced the output, whether replay is consistent, and whether critical evidence was missing.

The project has one core infrastructure layer and one interactive showcase:

**0G Mirror Core** creates a Decision Trace for each AI-agent decision. The trace includes task input, public context, evidence used, model/provider/config metadata, selected tools, agent output, short public rationale, hashes, storage URI/root, verification status, and on-chain attestation. The trace JSON is stored on 0G Storage, and the hash/root/URI/status are registered in a 0G Chain smart contract called `MirrorRegistry`.

**Olympus Arena** is the live demo mode. Two deterministic AI agents, such as Aegis and Nyx, compete on a decision challenge like “Should this DeFi vault be trusted?” Mirror records both Decision Traces, verifies them by replay, and lets the user appeal to Olympus. The Olympus Judge compares the traces, evidence coverage, and verification status, then creates a Court Verdict that can also be stored on 0G Storage and attested on-chain.

The MVP is AI-native without relying on paid API keys. It ships deterministic agent adapters so the demo is reliable, while preserving an adapter architecture for future model providers.

# Key lines

- We didn’t build another AI agent app. We built the mirror that proves what agents decided.
- Decision traces, not hidden chain-of-thought.
- Stored on 0G. Verified by replay. Attested on-chain.
- Olympus Arena is the live showcase: agents compete, appeal, and prove their decisions.

# 0G usage

- 0G Storage stores Decision Trace JSON and Court Verdict JSON.
- 0G Chain stores decision trace attestations and court verdict attestations.
- Verification status is replay-derived and can be updated on-chain.

# Chain-of-thought safety

0G Mirror does not expose or claim to record private chain-of-thought. It records a public verifiable decision trail: inputs, evidence, model config, tool usage, public rationale, output, hashes, replay status, and on-chain attestation.
