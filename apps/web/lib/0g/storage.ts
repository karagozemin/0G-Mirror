import "server-only";

import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { ethers } from "ethers";

export type UploadResult = {
  uri: string;
  root: string;
  txHash?: string;
};

export class Missing0GConfigError extends Error {
  constructor(message = "Missing 0G Storage credentials.") {
    super(message);
    this.name = "Missing0GConfigError";
  }
}

function storageConfig() {
  const evmRpc = process.env["0G_STORAGE_RPC"] ?? process.env.NEXT_PUBLIC_0G_CHAIN_RPC;
  const indexerRpc = process.env["0G_STORAGE_INDEXER"];
  const privateKey = process.env["0G_STORAGE_PRIVATE_KEY"] ?? process.env.PRIVATE_KEY;

  if (!evmRpc || !indexerRpc || !privateKey) {
    throw new Missing0GConfigError(
      "Missing 0G Storage config. Set 0G_STORAGE_RPC, 0G_STORAGE_INDEXER, and 0G_STORAGE_PRIVATE_KEY."
    );
  }

  return { evmRpc, indexerRpc, privateKey };
}

function parseStorageUri(uri: string) {
  if (uri.startsWith("0g://")) return uri.replace("0g://", "");
  if (/^0x[0-9a-fA-F]{64}$/.test(uri)) return uri;
  throw new Error(`Unsupported 0G storage URI: ${uri}`);
}

export async function uploadJsonTo0G(data: unknown): Promise<UploadResult> {
  const { evmRpc, indexerRpc, privateKey } = storageConfig();
  const { Indexer, MemData } = await import("@0gfoundation/0g-storage-ts-sdk");
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2));
  const file = new MemData(bytes);
  const [tree, treeError] = await file.merkleTree();

  if (treeError || !tree) {
    throw treeError ?? new Error("Unable to compute 0G merkle root.");
  }

  const provider = new ethers.JsonRpcProvider(evmRpc);
  const signer = new ethers.Wallet(privateKey, provider);
  const indexer = new Indexer(indexerRpc);
  const [upload, uploadError] = await indexer.upload(file, evmRpc, signer as never);

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

export async function downloadJsonFrom0G(uri: string): Promise<unknown> {
  const { indexerRpc } = storageConfig();
  const { Indexer } = await import("@0gfoundation/0g-storage-ts-sdk");
  const rootHash = parseStorageUri(uri);
  const outputPath = path.join(os.tmpdir(), `0g-mirror-${rootHash.replace(/^0x/, "")}.json`);
  const indexer = new Indexer(indexerRpc);
  const error = await indexer.download(rootHash, outputPath, true);

  if (error) {
    throw error;
  }

  const file = await fs.readFile(outputPath, "utf8");
  return JSON.parse(file);
}
