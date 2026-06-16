import { keccak256, toUtf8Bytes } from "ethers";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

function normalize(value: unknown): JsonValue {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => normalize(item));
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, entry]) => typeof entry !== "undefined")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, normalize(entry)])
    );
  }

  return String(value);
}

export function stableStringify(value: unknown) {
  return JSON.stringify(normalize(value));
}

export function hashText(value: string) {
  return keccak256(toUtf8Bytes(value));
}

export function hashJson(value: unknown) {
  return hashText(stableStringify(value));
}

export function shortHash(hash?: string, size = 6) {
  if (!hash) return "pending";
  return `${hash.slice(0, size + 2)}...${hash.slice(-size)}`;
}

export function computeDecisionHashes(
  trace: Omit<DecisionTrace, "hashes"> & {
    hashes?: Partial<DecisionTrace["hashes"]>;
  }
) {
  const inputHash = hashJson({
    task: trace.task,
    evidence: trace.evidence
  });
  const outputHash = hashJson(trace.decision);
  const decisionHash = hashJson({
    schema: trace.schema,
    agent: trace.agent,
    task: trace.task,
    model: trace.model,
    toolsUsed: trace.toolsUsed,
    decision: trace.decision,
    evidence: trace.evidence,
    inputHash,
    outputHash
  });

  return { inputHash, outputHash, decisionHash };
}

export function ensureBytes32(value: string) {
  if (/^0x[0-9a-fA-F]{64}$/.test(value)) return value;
  return hashText(value);
}
