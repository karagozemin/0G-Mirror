"use client";

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId } from "wagmi";
import { MIRROR_REGISTRY_ABI, verificationStatusToEnum } from "@/lib/contracts/MirrorRegistry";
import type { VerificationStatus } from "@/lib/schemas/decision-trace";
import galileoChain from "@/lib/wallet/chains";
import { getRegistryAddress } from "@/lib/wallet/require";

function ensureOnGalileo(chainId?: number) {
  return chainId === galileoChain.id;
}

export function useRegisterTraceWithWallet({
  registryAddress,
  decisionHash,
  traceURI,
  traceRoot,
  enabled = true
}: {
  registryAddress: string;
  decisionHash: string;
  traceURI: string;
  traceRoot: string;
  enabled?: boolean;
}) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const ready = enabled && isConnected && ensureOnGalileo(chainId) && Boolean(decisionHash && traceURI && traceRoot);

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data });

  return {
    enabled: ready,
    isConnected,
    wrongNetwork: isConnected && !ensureOnGalileo(chainId),
    write: () =>
      write.writeContract({
        address: registryAddress as `0x${string}`,
        abi: MIRROR_REGISTRY_ABI,
        functionName: "registerDecisionTrace",
        args: [decisionHash as `0x${string}`, traceURI, traceRoot as `0x${string}`],
        chainId: galileoChain.id
      }),
    data: write.data,
    isLoading: write.isPending || wait.isLoading,
    isSuccess: wait.isSuccess,
    error: write.error ?? wait.error
  };
}

export function useUpdateStatusWithWallet({
  registryAddress,
  traceId,
  status,
  enabled = true
}: {
  registryAddress: string;
  traceId: number;
  status: VerificationStatus;
  enabled?: boolean;
}) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const ready = enabled && isConnected && ensureOnGalileo(chainId) && traceId > 0;

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data });

  return {
    enabled: ready,
    write: () =>
      write.writeContract({
        address: registryAddress as `0x${string}`,
        abi: MIRROR_REGISTRY_ABI,
        functionName: "updateVerificationStatus",
        args: [BigInt(traceId), verificationStatusToEnum[status]],
        chainId: galileoChain.id
      }),
    data: write.data,
    isLoading: write.isPending || wait.isLoading,
    isSuccess: wait.isSuccess,
    error: write.error ?? wait.error
  };
}

export function useRegisterVerdictWithWallet({
  registryAddress,
  traceIdA,
  traceIdB,
  verdictURI,
  verdictRoot,
  winningTraceId,
  enabled = true
}: {
  registryAddress: string;
  traceIdA: number;
  traceIdB: number;
  verdictURI: string;
  verdictRoot: string;
  winningTraceId: number;
  enabled?: boolean;
}) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const ready =
    enabled &&
    isConnected &&
    ensureOnGalileo(chainId) &&
    traceIdA > 0 &&
    traceIdB > 0 &&
    Boolean(verdictURI && verdictRoot && winningTraceId > 0);

  const write = useWriteContract();
  const wait = useWaitForTransactionReceipt({ hash: write.data });

  return {
    enabled: ready,
    write: () =>
      write.writeContract({
        address: registryAddress as `0x${string}`,
        abi: MIRROR_REGISTRY_ABI,
        functionName: "registerCourtVerdict",
        args: [
          BigInt(traceIdA),
          BigInt(traceIdB),
          verdictURI,
          verdictRoot as `0x${string}`,
          BigInt(winningTraceId)
        ],
        chainId: galileoChain.id
      }),
    data: write.data,
    isLoading: write.isPending || wait.isLoading,
    isSuccess: wait.isSuccess,
    error: write.error ?? wait.error
  };
}

export { getRegistryAddress };
