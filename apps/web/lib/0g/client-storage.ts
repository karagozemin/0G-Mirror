"use client";

import { BrowserProvider, JsonRpcSigner } from "ethers";
import { getWalletClient } from "@wagmi/core";
import type { WalletClient } from "viem";
import { wagmiConfig } from "@/lib/wallet/wagmi";
import galileoChain from "@/lib/wallet/chains";
import { ensureGalileoChain } from "@/lib/wallet/require";
import type { UploadResult } from "@/lib/0g/storage";

const STORAGE_RPC = process.env.NEXT_PUBLIC_0G_CHAIN_RPC ?? "https://evmrpc-testnet.0g.ai";
const STORAGE_INDEXER =
  process.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";

function walletClientToSigner(walletClient: WalletClient): JsonRpcSigner {
  const { account, chain, transport } = walletClient;
  if (!account || !chain) {
    throw new Error("Wallet client unavailable. Reconnect your wallet and try again.");
  }

  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address
  };
  const provider = new BrowserProvider(transport, network);
  return new JsonRpcSigner(provider, account.address);
}

export async function uploadJsonWithWallet(data: unknown): Promise<UploadResult> {
  await ensureGalileoChain();

  const walletClient = await getWalletClient(wagmiConfig, { chainId: galileoChain.id });
  if (!walletClient) {
    throw new Error("Wallet client unavailable. Reconnect your wallet and try again.");
  }

  const signer = walletClientToSigner(walletClient);
  const { Indexer, MemData } = await import("@0gfoundation/0g-storage-ts-sdk");
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
  const file = new MemData(bytes);
  const [tree, treeError] = await file.merkleTree();

  if (treeError || !tree) {
    throw treeError ?? new Error("Unable to compute 0G merkle root.");
  }

  const indexer = new Indexer(STORAGE_INDEXER);
  const [upload, uploadError] = await indexer.upload(file, STORAGE_RPC, signer as never);

  if (uploadError || !upload) {
    throw uploadError ?? new Error("0G Storage upload failed.");
  }

  const uploadedRoot = "rootHash" in upload ? upload.rootHash : upload.rootHashes[0] ?? tree.rootHash();
  const txHash = "txHash" in upload ? upload.txHash : upload.txHashes[0];

  if (!uploadedRoot) {
    throw new Error("0G Storage upload did not return a root hash.");
  }

  return {
    uri: `0g://${uploadedRoot}`,
    root: uploadedRoot,
    txHash
  };
}
