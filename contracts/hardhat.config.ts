import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
dotenv.config({ path: "../.env.local" });
dotenv.config();

const privateKey = process.env.PRIVATE_KEY;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    "0g": {
      url: process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai",
      chainId: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
      accounts: privateKey ? [privateKey] : []
    },
    "0gGalileo": {
      url: process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai",
      chainId: Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602),
      accounts: privateKey ? [privateKey] : []
    }
  }
};

export default config;
