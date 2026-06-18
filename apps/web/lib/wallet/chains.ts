import { defineChain } from "viem";

export const galileoChain = defineChain({
  id: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
  name: "0G Galileo Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai"] }
  },
  blockExplorers: {
    default: { name: "0G Explorer", url: "https://explorer.0g.ai" }
  },
  testnet: true
});

export default galileoChain;
