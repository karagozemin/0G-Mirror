import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "viem";
import { galileoChain } from "./chains";

const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "e40e7554a29d019bedaad883896164a4";
const rpcUrl = process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai";

export const wagmiConfig = getDefaultConfig({
  appName: "0G Mirror",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [galileoChain],
  transports: {
    [galileoChain.id]: http(rpcUrl)
  },
  ssr: true
});

export const chains = [galileoChain] as const;
