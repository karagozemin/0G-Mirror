import "server-only";

import { ethers } from "ethers";
import { MIRROR_REGISTRY_ABI, verificationStatusToEnum } from "@/lib/contracts/MirrorRegistry";
import type { VerificationStatus } from "@/lib/schemas/decision-trace";
import { ensureBytes32 } from "@/lib/utils/hash";

export class MissingChainConfigError extends Error {
  constructor(message = "Missing 0G Chain configuration.") {
    super(message);
    this.name = "MissingChainConfigError";
  }
}

function chainConfig() {
  const registryAddress = process.env.NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS;
  const rpc = process.env.NEXT_PUBLIC_0G_CHAIN_RPC;
  const chainId = Number(process.env.NEXT_PUBLIC_0G_CHAIN_ID ?? 16602);
  const privateKey = process.env.PRIVATE_KEY;

  if (!registryAddress || !rpc || !privateKey) {
    throw new MissingChainConfigError(
      "Missing chain config. Set NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS, NEXT_PUBLIC_0G_CHAIN_RPC, NEXT_PUBLIC_0G_CHAIN_ID, and PRIVATE_KEY."
    );
  }

  return { registryAddress, rpc, chainId, privateKey };
}

function registry() {
  const config = chainConfig();
  const provider = new ethers.JsonRpcProvider(config.rpc, config.chainId);
  const signer = new ethers.Wallet(config.privateKey, provider);
  const contract = new ethers.Contract(config.registryAddress, MIRROR_REGISTRY_ABI, signer);
  return { config, contract };
}

function eventArg(receipt: ethers.ContractTransactionReceipt | null, eventName: string, argName: string) {
  if (!receipt) throw new Error(`No receipt for ${eventName}.`);
  const iface = new ethers.Interface(MIRROR_REGISTRY_ABI);

  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === eventName) {
        return parsed.args.getValue(argName);
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Event ${eventName} not found in receipt.`);
}

export async function registerDecisionTraceOnChain(input: {
  decisionHash: string;
  traceURI: string;
  traceRoot: string;
}) {
  const { config, contract } = registry();
  const tx = await contract.registerDecisionTrace(
    ensureBytes32(input.decisionHash),
    input.traceURI,
    ensureBytes32(input.traceRoot)
  );
  const receipt = await tx.wait();
  const traceId = eventArg(receipt, "DecisionTraceRegistered", "traceId");

  return {
    mode: "0g" as const,
    traceId: Number(traceId),
    txHash: receipt?.hash ?? tx.hash,
    chainId: config.chainId,
    registryAddress: config.registryAddress
  };
}

export async function updateVerificationStatusOnChain(traceId: number, status: VerificationStatus) {
  const { config, contract } = registry();
  const tx = await contract.updateVerificationStatus(traceId, verificationStatusToEnum[status]);
  const receipt = await tx.wait();

  return {
    mode: "0g" as const,
    traceId,
    txHash: receipt?.hash ?? tx.hash,
    chainId: config.chainId,
    registryAddress: config.registryAddress
  };
}

export async function registerCourtVerdictOnChain(input: {
  traceIdA: number;
  traceIdB: number;
  verdictURI: string;
  verdictRoot: string;
  winningTraceId: number;
}) {
  const { config, contract } = registry();
  const tx = await contract.registerCourtVerdict(
    input.traceIdA,
    input.traceIdB,
    input.verdictURI,
    ensureBytes32(input.verdictRoot),
    input.winningTraceId
  );
  const receipt = await tx.wait();
  const verdictId = eventArg(receipt, "CourtVerdictRegistered", "verdictId");

  return {
    mode: "0g" as const,
    verdictId: Number(verdictId),
    txHash: receipt?.hash ?? tx.hash,
    chainId: config.chainId,
    registryAddress: config.registryAddress
  };
}
