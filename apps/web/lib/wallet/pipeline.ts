"use client";

import type { CourtVerdict } from "@/lib/schemas/court-verdict";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { applyVerification } from "@/lib/ai/verifier";
import { uploadJsonViaStorageApi } from "@/lib/0g/client-storage";
import galileoChain from "@/lib/wallet/chains";
import { getRegistryAddress } from "@/lib/wallet/require";
import {
  registerCourtVerdictOnWallet,
  registerDecisionTraceOnWallet,
  updateVerificationStatusOnWallet
} from "@/lib/wallet/registry-actions";
import { saveTrace, saveVerdict } from "@/lib/utils/local-store";

export async function storeTraceWithWallet(trace: DecisionTrace): Promise<DecisionTrace> {
  if (trace.storage?.uri) return trace;

  const upload = await uploadJsonViaStorageApi(trace);
  const nextTrace: DecisionTrace = {
    ...trace,
    storage: {
      mode: "0g",
      uri: upload.uri,
      root: upload.root,
      txHash: upload.txHash
    }
  };
  saveTrace(nextTrace);
  return nextTrace;
}

export async function registerTraceWithWallet(trace: DecisionTrace): Promise<DecisionTrace> {
  if (trace.attestation?.traceId) return trace;

  const stored = trace.storage?.uri ? trace : await storeTraceWithWallet(trace);
  if (!stored.storage) {
    throw new Error("Trace must be stored on 0G before on-chain registration.");
  }

  const { traceId, txHash } = await registerDecisionTraceOnWallet({
    decisionHash: stored.hashes.decisionHash,
    traceURI: stored.storage.uri,
    traceRoot: stored.storage.root
  });

  const nextTrace: DecisionTrace = {
    ...stored,
    attestation: {
      mode: "0g",
      chainId: galileoChain.id,
      registryAddress: getRegistryAddress(),
      traceId,
      txHash
    }
  };
  saveTrace(nextTrace);
  return nextTrace;
}

export async function verifyTraceWithWallet(trace: DecisionTrace): Promise<DecisionTrace> {
  const registered = trace.attestation?.traceId ? trace : await registerTraceWithWallet(trace);
  const verified = applyVerification(registered);
  const onChainTraceId = Number(registered.attestation?.traceId);

  if (!onChainTraceId) {
    throw new Error("Trace must be registered on-chain before verification.");
  }

  await updateVerificationStatusOnWallet({
    traceId: onChainTraceId,
    status: verified.verification.status
  });

  saveTrace(verified);
  return verified;
}

export async function storeVerdictWithWallet(verdict: CourtVerdict): Promise<CourtVerdict> {
  if (verdict.storage?.uri) return verdict;

  const upload = await uploadJsonViaStorageApi(verdict);
  const nextVerdict: CourtVerdict = {
    ...verdict,
    storage: {
      mode: "0g",
      uri: upload.uri,
      root: upload.root,
      txHash: upload.txHash
    }
  };
  saveVerdict(nextVerdict);
  return nextVerdict;
}

export async function registerVerdictWithWallet(
  verdict: CourtVerdict,
  traceA: DecisionTrace,
  traceB: DecisionTrace
): Promise<CourtVerdict> {
  if (verdict.attestation?.verdictId) return verdict;

  const stored = verdict.storage?.uri ? verdict : await storeVerdictWithWallet(verdict);
  const traceIdA = Number(traceA.attestation?.traceId);
  const traceIdB = Number(traceB.attestation?.traceId);

  if (!traceIdA || !traceIdB) {
    throw new Error("Both traces must be registered on-chain before registering a court verdict.");
  }

  if (!stored.storage) {
    throw new Error("Verdict must be stored on 0G before on-chain registration.");
  }

  const winningTraceId =
    stored.verdict.winner === traceA.agent.name ? traceIdA : traceIdB;

  const { verdictId, txHash } = await registerCourtVerdictOnWallet({
    traceIdA,
    traceIdB,
    verdictURI: stored.storage.uri,
    verdictRoot: stored.storage.root,
    winningTraceId
  });

  const nextVerdict: CourtVerdict = {
    ...stored,
    attestation: {
      mode: "0g",
      chainId: galileoChain.id,
      registryAddress: getRegistryAddress(),
      verdictId,
      txHash
    }
  };
  saveVerdict(nextVerdict);
  return nextVerdict;
}
