# 90-Second Demo Script

## 0-10s: Landing

Open `/`.

“0G Mirror is verifiable decision infrastructure for AI agents. We didn’t build another AI agent app. We built the mirror that proves what agents decided.”

## 10-20s: Problem

“Agents are starting to move money and make trust decisions, but users cannot prove which evidence the agent used, whether the same evidence reproduces the decision, or whether something important was omitted.”

## 20-35s: Create Decision

Open `/mirror`.

Choose `Aegis`, choose `DeFi Vault Risk Decision`, click **Run Decision**.

“This creates a Decision Trace: input, public context, evidence, model config, tools, output, public rationale, and hashes. Decision traces, not hidden chain-of-thought.”

## 35-50s: Store and Attest

Click **Store on 0G**.

Click **Register On-chain**.

“The trace JSON is prepared for 0G Storage, and the decision hash, URI, and root are registered in the MirrorRegistry contract on 0G Chain.”

Real proof to show:

```txt
0G Storage URI: 0g://0xe58925c613298780175066ae3e2762e6154b152329a3b3c8b532716196ef4aee
Trace ID: 1
Decision Hash: 0x7f1775e02212e8764cefc347a09df82aa33ebe05d377e2bb496fb9c2fe1da884
Register Trace Tx: 0x439d5a8bca2bd17b051738d12124b90a0c5cb3ab5c1cc996a76e45137f3b23de
Verification Tx: 0x7061af685a1c61e3db2ee976034baad35da506b73464a737dace23027eae2515
```

## 50-60s: Verify

Click **Verify Decision**.

“Mirror replays deterministic scoring against the same public evidence. If the replay matches, the trace is Verified. If evidence is missing, it is marked Missing Evidence. If the output diverges, it is Inconsistent.”

## 60-75s: Arena

Open `/arena`.

Click **Start Battle** with `Aegis` vs `Nyx`.

“Olympus Arena is the live showcase: agents compete, appeal, and prove their decisions. This is still one project: 0G Mirror, with an interactive demo mode.”

## 75-90s: Appeal

Click **Verify Both**.

Click **Appeal to Olympus**.

“The AI Judge reviews both Decision Traces and creates a Court Verdict. That verdict is also stored on 0G Storage and attested on-chain, giving the community a shareable proof card.”
