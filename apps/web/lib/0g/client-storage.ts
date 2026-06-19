"use client";

import { BrowserProvider, JsonRpcSigner } from "ethers";
import { getWalletClient } from "@wagmi/core";
import type { WalletClient } from "viem";
import { wagmiConfig } from "@/lib/wallet/wagmi";
import galileoChain from "@/lib/wallet/chains";
import { ensureGalileoChain } from "@/lib/wallet/require";
import type { UploadResult } from "@/lib/0g/storage";

const STORAGE_RPC =
  process.env.NEXT_PUBLIC_0G_STORAGE_RPC ??
  process.env.NEXT_PUBLIC_0G_CHAIN_RPC ??
  "https://evmrpc-testnet.0g.ai";
const STORAGE_INDEXER =
  process.env.NEXT_PUBLIC_0G_STORAGE_INDEXER ?? "https://indexer-storage-testnet-turbo.0g.ai";

function storageErrorMessage(error: unknown, fallback: string) {
  if (!error) return fallback;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return fallback;
  }
}

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
  let sdk: typeof import("@0gfoundation/0g-storage-ts-sdk");
  try {
    sdk = await import("@0gfoundation/0g-storage-ts-sdk");
  } catch (error) {
    throw new Error(`0G Storage SDK could not load in this browser: ${storageErrorMessage(error, "unknown error")}`);
  }

  const { Indexer, MemData } = sdk;
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
  const file = new MemData(bytes);
  const [tree, treeError] = await file.merkleTree();

  if (treeError || !tree) {
    throw new Error(storageErrorMessage(treeError, "Unable to compute 0G merkle root."));
  }

  const indexer = new Indexer(STORAGE_INDEXER);
  const [upload, uploadError] = await indexer.upload(file, STORAGE_RPC, signer as never);

  if (uploadError || !upload) {
    throw new Error(storageErrorMessage(uploadError, "0G Storage upload failed."));
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

export async function uploadJsonViaStorageApi(data: unknown): Promise<UploadResult> {
  const response = await fetch("/api/storage/upload", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data })
  });
  const payload = await response.json().catch(() => null) as
    | ({ error?: string } & Partial<UploadResult>)
    | null;

  if (!response.ok || !payload?.uri || !payload.root) {
    throw new Error(payload?.error ?? `0G Storage upload failed with HTTP ${response.status}.`);
  }

  return {
    uri: payload.uri,
    root: payload.root,
    txHash: payload.txHash
  };
}
