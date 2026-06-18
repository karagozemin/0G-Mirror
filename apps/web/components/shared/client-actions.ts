"use client";

import type { CourtVerdict } from "@/lib/schemas/court-verdict";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import {
  registerTraceWithWallet,
  registerVerdictWithWallet,
  storeTraceWithWallet,
  storeVerdictWithWallet,
  verifyTraceWithWallet
} from "@/lib/wallet/pipeline";

export async function ensureStoredTrace(trace: DecisionTrace) {
  if (trace.storage?.uri) return { trace, notice: null as string | null };
  try {
    const nextTrace = await storeTraceWithWallet(trace);
    return { trace: nextTrace, notice: null };
  } catch (error) {
    return { trace, notice: error instanceof Error ? error.message : "Storage upload failed" };
  }
}

export async function ensureRegisteredTrace(trace: DecisionTrace) {
  if (trace.attestation?.traceId) return { trace, notice: null as string | null };
  try {
    const nextTrace = await registerTraceWithWallet(trace);
    return { trace: nextTrace, notice: null };
  } catch (error) {
    return { trace, notice: error instanceof Error ? error.message : "On-chain registration failed" };
  }
}

export async function ensureStoredAndRegisteredTrace(trace: DecisionTrace) {
  const stored = await ensureStoredTrace(trace);
  if (stored.notice) return stored;
  return ensureRegisteredTrace(stored.trace);
}

export async function updateTraceStatus(trace: DecisionTrace) {
  try {
    const nextTrace = await verifyTraceWithWallet(trace);
    return { trace: nextTrace, notice: null as string | null };
  } catch (error) {
    return { trace, notice: error instanceof Error ? error.message : "On-chain verification failed" };
  }
}

export async function storeAndAttestVerdict(
  verdict: CourtVerdict,
  traceA: DecisionTrace,
  traceB: DecisionTrace
) {
  try {
    const stored = await storeVerdictWithWallet(verdict);
    const attested = await registerVerdictWithWallet(stored, traceA, traceB);
    return { verdict: attested, notice: null as string | null };
  } catch (error) {
    return { verdict, notice: error instanceof Error ? error.message : "Court verdict attestation failed" };
  }
}
