"use client";

import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import galileoChain from "@/lib/wallet/chains";
import { WalletRequiredError } from "@/lib/wallet/errors";

export function useWalletPipeline() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { openConnectModal } = useConnectModal();

  function ensureConnected(): void {
    if (isConnected) return;
    openConnectModal?.();
    throw new WalletRequiredError();
  }

  return {
    isConnected,
    wrongNetwork: isConnected && chainId !== galileoChain.id,
    galileoChainId: galileoChain.id,
    ensureConnected
  };
}
