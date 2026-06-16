import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import type { CourtVerdict } from "@/lib/schemas/court-verdict";

const TRACE_KEY = "0g-mirror:decision-traces";
const VERDICT_KEY = "0g-mirror:court-verdicts";

function readMap<T>(key: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

function writeMap<T>(key: string, value: Record<string, T>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function saveTrace(trace: DecisionTrace) {
  const traces = readMap<DecisionTrace>(TRACE_KEY);
  traces[trace.traceId] = trace;
  writeMap(TRACE_KEY, traces);
}

export function getTrace(traceId: string) {
  return readMap<DecisionTrace>(TRACE_KEY)[traceId] ?? null;
}

export function saveVerdict(verdict: CourtVerdict) {
  const verdicts = readMap<CourtVerdict>(VERDICT_KEY);
  verdicts[verdict.hashes.verdictRoot] = verdict;
  writeMap(VERDICT_KEY, verdicts);
}
