"use client";

import { writeContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseEventLogs } from "viem";
import { wagmiConfig } from "@/lib/wallet/wagmi";
import galileoChain from "@/lib/wallet/chains";
import { MIRROR_REGISTRY_ABI, verificationStatusToEnum } from "@/lib/contracts/MirrorRegistry";
import type { VerificationStatus } from "@/lib/schemas/decision-trace";
import { ensureGalileoChain, getRegistryAddress } from "@/lib/wallet/require";

export async function registerDecisionTraceOnWallet(params: {
  decisionHash: string;
  traceURI: string;
  traceRoot: string;
}) {
  await ensureGalileoChain();
  const registryAddress = getRegistryAddress();

  const hash = await writeContract(wagmiConfig, {
    address: registryAddress,
    abi: MIRROR_REGISTRY_ABI,
    functionName: "registerDecisionTrace",
    args: [params.decisionHash as `0x${string}`, params.traceURI, params.traceRoot as `0x${string}`],
    chainId: galileoChain.id
  });

  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  const events = parseEventLogs({
    abi: MIRROR_REGISTRY_ABI,
    logs: receipt.logs,
    eventName: "DecisionTraceRegistered"
  });

  if (!events[0]) {
    throw new Error("Registry did not emit DecisionTraceRegistered.");
  }

  return {
    traceId: Number(events[0].args.traceId),
    txHash: receipt.transactionHash
  };
}

export async function updateVerificationStatusOnWallet(params: { traceId: number; status: VerificationStatus }) {
  await ensureGalileoChain();
  const registryAddress = getRegistryAddress();

  const hash = await writeContract(wagmiConfig, {
    address: registryAddress,
    abi: MIRROR_REGISTRY_ABI,
    functionName: "updateVerificationStatus",
    args: [BigInt(params.traceId), verificationStatusToEnum[params.status]],
    chainId: galileoChain.id
  });

  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  return { txHash: receipt.transactionHash };
}

export async function registerCourtVerdictOnWallet(params: {
  traceIdA: number;
  traceIdB: number;
  verdictURI: string;
  verdictRoot: string;
  winningTraceId: number;
}) {
  await ensureGalileoChain();
  const registryAddress = getRegistryAddress();

  const hash = await writeContract(wagmiConfig, {
    address: registryAddress,
    abi: MIRROR_REGISTRY_ABI,
    functionName: "registerCourtVerdict",
    args: [
      BigInt(params.traceIdA),
      BigInt(params.traceIdB),
      params.verdictURI,
      params.verdictRoot as `0x${string}`,
      BigInt(params.winningTraceId)
    ],
    chainId: galileoChain.id
  });

  const receipt = await waitForTransactionReceipt(wagmiConfig, { hash });
  const events = parseEventLogs({
    abi: MIRROR_REGISTRY_ABI,
    logs: receipt.logs,
    eventName: "CourtVerdictRegistered"
  });

  if (!events[0]) {
    throw new Error("Registry did not emit CourtVerdictRegistered.");
  }

  return {
    verdictId: Number(events[0].args.verdictId),
    txHash: receipt.transactionHash
  };
}
