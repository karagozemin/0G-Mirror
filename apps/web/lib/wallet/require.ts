import { getAccount, getChainId, switchChain } from "@wagmi/core";
import { wagmiConfig } from "@/lib/wallet/wagmi";
import galileoChain from "@/lib/wallet/chains";
import { WalletRequiredError } from "@/lib/wallet/errors";

export function getRegistryAddress(): `0x${string}` {
  const address = process.env.NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS;
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    throw new Error("Set NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS in .env.local to register traces on-chain.");
  }
  return address as `0x${string}`;
}

export async function requireWalletAddress(): Promise<`0x${string}`> {
  const account = getAccount(wagmiConfig);
  if (!account.isConnected || !account.address) {
    throw new WalletRequiredError();
  }
  return account.address;
}

export async function ensureGalileoChain(): Promise<void> {
  await requireWalletAddress();
  const chainId = getChainId(wagmiConfig);
  if (chainId === galileoChain.id) return;
  await switchChain(wagmiConfig, { chainId: galileoChain.id });
}
