"use client";

import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { applyVerification } from "@/lib/ai/verifier";
import galileoChain from "@/lib/wallet/chains";
import { getRegistryAddress } from "@/lib/wallet/require";
import {
  batchRegisterDecisionTracesOnWallet,
  batchUpdateVerificationStatusOnWallet
} from "@/lib/wallet/registry-actions";
import { storeTraceWithWallet } from "@/lib/wallet/pipeline";
import { saveTrace } from "@/lib/utils/local-store";

export type ArenaProgressUpdate = {
  step: number;
  totalSteps: number;
  phase: string;
  label: string;
  detail: string;
  percent: number;
};

function attachAttestation(
  trace: DecisionTrace,
  result: { traceId: number; txHash: string }
): DecisionTrace {
  return {
    ...trace,
    attestation: {
      mode: "0g",
      chainId: galileoChain.id,
      registryAddress: getRegistryAddress(),
      traceId: result.traceId,
      txHash: result.txHash
    }
  };
}

export function planVerifyBothSteps(traceA: DecisionTrace, traceB: DecisionTrace) {
  const needsStoreA = !traceA.storage?.uri;
  const needsStoreB = !traceB.storage?.uri;
  const needsRegisterA = !traceA.attestation?.traceId;
  const needsRegisterB = !traceB.attestation?.traceId;
  const needsVerifyA = traceA.verification.status === "Pending";
  const needsVerifyB = traceB.verification.status === "Pending";
  const storageStepCount = (needsStoreA ? 1 : 0) + (needsStoreB ? 1 : 0);

  const walletTxCount =
    (needsRegisterA || needsRegisterB ? 1 : 0) +
    (needsVerifyA || needsVerifyB ? 1 : 0);

  const totalSteps =
    storageStepCount + walletTxCount + (needsVerifyA || needsVerifyB ? 1 : 0);

  return {
    needsStoreA,
    needsStoreB,
    needsRegisterA,
    needsRegisterB,
    needsVerifyA,
    needsVerifyB,
    storageStepCount,
    walletTxCount,
    totalSteps
  };
}

export async function verifyBothTracesWithWallet(
  traceA: DecisionTrace,
  traceB: DecisionTrace,
  onProgress?: (update: ArenaProgressUpdate) => void
): Promise<{ traceA: DecisionTrace; traceB: DecisionTrace }> {
  const plan = planVerifyBothSteps(traceA, traceB);
  let step = 0;

  const progress = (phase: string, label: string, detail: string) => {
    step += 1;
    onProgress?.({
      step,
      totalSteps: plan.totalSteps,
      phase,
      label,
      detail,
      percent: Math.min(92, Math.round((step / plan.totalSteps) * 92))
    });
  };

  let currentA = traceA;
  let currentB = traceB;

  if (plan.needsStoreA) {
    progress("storage", "0G Storage", "Uploading challenger Decision Trace through the storage API.");
    currentA = await storeTraceWithWallet(currentA);
  }

  if (plan.needsStoreB) {
    progress("storage", "0G Storage", "Uploading defender Decision Trace through the storage API.");
    currentB = await storeTraceWithWallet(currentB);
  }

  const registerEntries: DecisionTrace[] = [];
  if (plan.needsRegisterA) registerEntries.push(currentA);
  if (plan.needsRegisterB) registerEntries.push(currentB);

  if (registerEntries.length > 0) {
    const batched = registerEntries.length > 1;
    progress(
      "chain",
      "On-chain registration",
      batched
        ? "Confirm batched registration for both traces in your wallet."
        : "Confirm trace registration in your wallet."
    );

    const results = await batchRegisterDecisionTracesOnWallet(
      registerEntries.map((trace) => ({
        decisionHash: trace.hashes.decisionHash,
        traceURI: trace.storage!.uri,
        traceRoot: trace.storage!.root
      }))
    );

    let resultIndex = 0;
    if (plan.needsRegisterA) {
      currentA = attachAttestation(currentA, results[resultIndex]!);
      saveTrace(currentA);
      resultIndex += 1;
    }
    if (plan.needsRegisterB) {
      currentB = attachAttestation(currentB, results[resultIndex]!);
      saveTrace(currentB);
    }
  }

  let verifiedA = currentA;
  let verifiedB = currentB;

  if (plan.needsVerifyA || plan.needsVerifyB) {
    progress("verify", "Replay verification", "Replaying both decision traces locally.");
    verifiedA = applyVerification(currentA);
    verifiedB = applyVerification(currentB);

    const verifyEntries: Array<{ traceId: number; status: DecisionTrace["verification"]["status"] }> = [];
    if (plan.needsVerifyA) {
      verifyEntries.push({
        traceId: Number(verifiedA.attestation?.traceId),
        status: verifiedA.verification.status
      });
    }
    if (plan.needsVerifyB) {
      verifyEntries.push({
        traceId: Number(verifiedB.attestation?.traceId),
        status: verifiedB.verification.status
      });
    }

    const batched = verifyEntries.length > 1;
    progress(
      "chain",
      "Verification status",
      batched
        ? "Confirm batched verification status for both traces in your wallet."
        : "Confirm verification status in your wallet."
    );

    await batchUpdateVerificationStatusOnWallet(verifyEntries);
    saveTrace(verifiedA);
    saveTrace(verifiedB);
  }

  onProgress?.({
    step: plan.totalSteps,
    totalSteps: plan.totalSteps,
    phase: "complete",
    label: "Arena verification complete",
    detail: "Both traces are stored, registered, and verified on-chain.",
    percent: 100
  });

  return { traceA: verifiedA, traceB: verifiedB };
}
