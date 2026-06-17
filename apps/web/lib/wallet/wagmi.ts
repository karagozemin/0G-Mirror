import { createConfig } from "wagmi";
import { http } from "viem";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import { galileoChain } from "./chains";

const chains = [galileoChain];
const WALLETCONNECT_PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "e40e7554a29d019bedaad883896164a4";
const defaultWallets = getDefaultWallets({ appName: "0G Mirror", projectId: WALLETCONNECT_PROJECT_ID, chains });
const { connectors } = defaultWallets;

const rpcUrl = process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai";

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [galileoChain.id]: http(rpcUrl)
  },
  ssr: true
});

export { chains };
