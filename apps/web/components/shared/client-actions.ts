"use client";

import type { CourtVerdict } from "@/lib/schemas/court-verdict";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { hashJson, shortHash } from "@/lib/utils/hash";
import { localNumericId } from "@/lib/utils/ids";
import { saveTrace, saveVerdict } from "@/lib/utils/local-store";

export const LOCAL_DEMO_MESSAGE = "Local demo mode — connect 0G credentials for real storage.";

type ApiError = {
  error?: string;
  code?: string;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = (await response.json().catch(() => ({}))) as T & ApiError;

  if (!response.ok) {
    const message = payload.code === "MISSING_CONFIG" ? LOCAL_DEMO_MESSAGE : payload.error ?? "Request failed";
    throw new Error(message);
  }

  return payload;
}

function localStorageLocation(data: unknown, kind: string) {
  const root = hashJson(data);
  return {
    mode: "local" as const,
    uri: `local://0g-mirror/${kind}/${shortHash(root, 8).replace("...", "-")}`,
    root
  };
}

function localTraceAttestation(trace: DecisionTrace) {
  return {
    mode: "local" as const,
    chainId: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
    registryAddress: process.env.NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS,
    traceId: `local-${localNumericId(trace.hashes.decisionHash)}`,
    txHash: `local-${trace.hashes.decisionHash.slice(2, 14)}`
  };
}

function localVerdictAttestation(verdict: CourtVerdict) {
  return {
    mode: "local" as const,
    chainId: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
    registryAddress: process.env.NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS,
    verdictId: `local-${localNumericId(verdict.hashes.verdictRoot)}`,
    txHash: `local-${verdict.hashes.verdictRoot.slice(2, 14)}`
  };
}

export async function ensureStoredTrace(trace: DecisionTrace) {
  if (trace.storage) return { trace, notice: null as string | null };

  try {
    const storage = await postJson<DecisionTrace["storage"]>("/api/storage/upload", {
      data: trace
    });
    const nextTrace = { ...trace, storage };
    saveTrace(nextTrace);
    return { trace: nextTrace, notice: null };
  } catch (error) {
    const storage = localStorageLocation(trace, "decision-trace");
    const nextTrace = { ...trace, storage };
    saveTrace(nextTrace);
    return { trace: nextTrace, notice: error instanceof Error ? error.message : LOCAL_DEMO_MESSAGE };
  }
}

export async function ensureRegisteredTrace(trace: DecisionTrace) {
  if (trace.attestation) return { trace, notice: null as string | null };

  if (!trace.storage) {
    const stored = await ensureStoredTrace(trace);
    trace = stored.trace;
  }

  try {
    const attestation = await postJson<DecisionTrace["attestation"]>("/api/chain/register-trace", {
      decisionHash: trace.hashes.decisionHash,
      traceURI: trace.storage?.uri,
      traceRoot: trace.storage?.root
    });
    const nextTrace = { ...trace, attestation };
    saveTrace(nextTrace);
    return { trace: nextTrace, notice: null };
  } catch (error) {
    const nextTrace = { ...trace, attestation: localTraceAttestation(trace) };
    saveTrace(nextTrace);
    return { trace: nextTrace, notice: error instanceof Error ? error.message : LOCAL_DEMO_MESSAGE };
  }
}

export async function ensureStoredAndRegisteredTrace(trace: DecisionTrace) {
  const stored = await ensureStoredTrace(trace);
  const registered = await ensureRegisteredTrace(stored.trace);
  return {
    trace: registered.trace,
    notice: registered.notice ?? stored.notice
  };
}

export async function updateTraceStatus(trace: DecisionTrace) {
  if (trace.attestation?.mode !== "0g" || typeof trace.attestation.traceId !== "number") {
    saveTrace(trace);
    return { trace, notice: trace.attestation ? LOCAL_DEMO_MESSAGE : null };
  }

  try {
    const attestation = await postJson<DecisionTrace["attestation"]>("/api/chain/update-status", {
      traceId: trace.attestation.traceId,
      status: trace.verification.status
    });
    const nextTrace = { ...trace, attestation };
    saveTrace(nextTrace);
    return { trace: nextTrace, notice: null };
  } catch (error) {
    saveTrace(trace);
    return { trace, notice: error instanceof Error ? error.message : LOCAL_DEMO_MESSAGE };
  }
}

export async function storeAndAttestVerdict(
  verdict: CourtVerdict,
  traceA: DecisionTrace,
  traceB: DecisionTrace,
  onProgress?: (phase: "storage" | "chain") => void
) {
  let nextVerdict = verdict;
  let notice: string | null = null;

  try {
    onProgress?.("storage");
    const storage = await postJson<CourtVerdict["storage"]>("/api/storage/upload", {
      data: verdict
    });
    nextVerdict = { ...nextVerdict, storage };
  } catch (error) {
    notice = error instanceof Error ? error.message : LOCAL_DEMO_MESSAGE;
    nextVerdict = { ...nextVerdict, storage: localStorageLocation(verdict, "court-verdict") };
  }

  const traceIdA = traceA.attestation?.traceId;
  const traceIdB = traceB.attestation?.traceId;
  const winnerTraceId =
    verdict.verdict.winner === traceA.agent.name ? traceIdA : traceIdB;

  if (typeof traceIdA === "number" && typeof traceIdB === "number" && typeof winnerTraceId === "number") {
    try {
      onProgress?.("chain");
      const attestation = await postJson<CourtVerdict["attestation"]>("/api/chain/register-verdict", {
        traceIdA,
        traceIdB,
        verdictURI: nextVerdict.storage?.uri,
        verdictRoot: nextVerdict.storage?.root ?? nextVerdict.hashes.verdictRoot,
        winningTraceId: winnerTraceId
      });
      nextVerdict = { ...nextVerdict, attestation };
    } catch (error) {
      notice = error instanceof Error ? error.message : LOCAL_DEMO_MESSAGE;
      nextVerdict = { ...nextVerdict, attestation: localVerdictAttestation(nextVerdict) };
    }
  } else {
    nextVerdict = { ...nextVerdict, attestation: localVerdictAttestation(nextVerdict) };
    notice = notice ?? LOCAL_DEMO_MESSAGE;
  }

  saveVerdict(nextVerdict);
  return { verdict: nextVerdict, notice };
}
