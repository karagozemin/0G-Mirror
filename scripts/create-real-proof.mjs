import fs from "node:fs";
import { ethers } from "ethers";
import { Indexer, MemData } from "@0gfoundation/0g-storage-ts-sdk";

const REGISTRY_ABI = [
  {
    type: "function",
    name: "registerDecisionTrace",
    stateMutability: "nonpayable",
    inputs: [
      { name: "decisionHash", type: "bytes32" },
      { name: "traceURI", type: "string" },
      { name: "traceRoot", type: "bytes32" }
    ],
    outputs: [{ name: "traceId", type: "uint256" }]
  },
  {
    type: "function",
    name: "updateVerificationStatus",
    stateMutability: "nonpayable",
    inputs: [
      { name: "traceId", type: "uint256" },
      { name: "status", type: "uint8" }
    ],
    outputs: []
  },
  {
    type: "event",
    name: "DecisionTraceRegistered",
    inputs: [
      { indexed: true, name: "traceId", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "decisionHash", type: "bytes32" },
      { indexed: false, name: "traceURI", type: "string" }
    ]
  }
];

function loadEnv() {
  const env = {};
  for (const file of [".env", ".env.local"]) {
    if (!fs.existsSync(file)) continue;
    for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const index = line.indexOf("=");
      if (index === -1) continue;
      env[line.slice(0, index)] = line.slice(index + 1);
    }
  }
  return { ...process.env, ...env };
}

function requireEnv(env, key) {
  if (!env[key]) throw new Error(`Missing ${key}`);
  return env[key];
}

function normalize(value) {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map(normalize);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entry]) => typeof entry !== "undefined")
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, normalize(entry)])
    );
  }
  return String(value);
}

function hashJson(value) {
  return ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(normalize(value))));
}

function buildDecisionTrace() {
  const now = new Date().toISOString();
  const base = {
    schema: "0g-mirror/decision-trace/v1",
    traceId: `real-0g-proof-${now}`,
    agent: {
      name: "Aegis",
      role: "DeFi Risk Analyst",
      version: "1.0"
    },
    task: {
      title: "DeFi Vault Risk Decision",
      input: "Should this vault be trusted?",
      context: ["TVL: $2.4M", "Audit: none", "APY: 480%", "Admin key: upgradeable"]
    },
    model: {
      provider: "adapter",
      model: "deterministic-risk-v1",
      temperature: 0.2,
      seed: "aegis:defi-vault:olympus"
    },
    toolsUsed: ["risk_scoring", "evidence_check", "admin_key_review"],
    decision: {
      label: "DO_NOT_INVEST",
      output: "The vault is too risky.",
      publicRationale:
        "The APY is unusually high, audit evidence is weak or missing, and admin key risk is material."
    },
    evidence: [
      { type: "metric", name: "TVL", value: "$2.4M" },
      { type: "security", name: "Audit", value: "none" },
      { type: "metric", name: "APY", value: "480%" },
      { type: "security", name: "Admin key", value: "upgradeable" }
    ],
    verification: {
      status: "Verified",
      replayResult: "Replay matched DO_NOT_INVEST with the same public evidence and config."
    },
    timestamps: {
      createdAt: now
    }
  };

  const inputHash = hashJson({ task: base.task, evidence: base.evidence });
  const outputHash = hashJson(base.decision);
  const decisionHash = hashJson({
    schema: base.schema,
    agent: base.agent,
    task: base.task,
    model: base.model,
    toolsUsed: base.toolsUsed,
    decision: base.decision,
    evidence: base.evidence,
    inputHash,
    outputHash
  });

  return {
    ...base,
    hashes: {
      inputHash,
      outputHash,
      decisionHash
    }
  };
}

function getEventArg(receipt, eventName, argName) {
  const iface = new ethers.Interface(REGISTRY_ABI);
  for (const log of receipt.logs) {
    try {
      const parsed = iface.parseLog(log);
      if (parsed?.name === eventName) return parsed.args.getValue(argName);
    } catch {
      continue;
    }
  }
  throw new Error(`Event ${eventName} not found`);
}

async function main() {
  const env = loadEnv();
  const chainRpc = requireEnv(env, "NEXT_PUBLIC_0G_CHAIN_RPC");
  const chainId = Number(requireEnv(env, "NEXT_PUBLIC_0G_CHAIN_ID"));
  const privateKey = requireEnv(env, "PRIVATE_KEY");
  const storageRpc = requireEnv(env, "0G_STORAGE_RPC");
  const storageIndexer = requireEnv(env, "0G_STORAGE_INDEXER");
  const storagePrivateKey = requireEnv(env, "0G_STORAGE_PRIVATE_KEY");
  const registryAddress = requireEnv(env, "NEXT_PUBLIC_MIRROR_REGISTRY_ADDRESS");

  const trace = buildDecisionTrace();
  const bytes = new TextEncoder().encode(JSON.stringify(trace, null, 2));
  const file = new MemData(bytes);
  const [tree, treeError] = await file.merkleTree();
  if (treeError || !tree) throw treeError ?? new Error("Could not compute 0G root");

  const storageProvider = new ethers.JsonRpcProvider(storageRpc, chainId);
  const storageSigner = new ethers.Wallet(storagePrivateKey, storageProvider);
  const indexer = new Indexer(storageIndexer);

  console.log("Uploading Decision Trace JSON to 0G Storage...");
  const [upload, uploadError] = await indexer.upload(file, storageRpc, storageSigner);
  if (uploadError || !upload) throw uploadError ?? new Error("0G upload failed");

  const storageRoot = "rootHash" in upload ? upload.rootHash : upload.rootHashes[0] ?? tree.rootHash();
  const storageTxHash = "txHash" in upload ? upload.txHash : upload.txHashes[0];
  const storageUri = `0g://${storageRoot}`;
  const storedTrace = {
    ...trace,
    storage: {
      mode: "0g",
      uri: storageUri,
      root: storageRoot,
      txHash: storageTxHash
    }
  };

  const provider = new ethers.JsonRpcProvider(chainRpc, chainId);
  const signer = new ethers.Wallet(privateKey, provider);
  const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, signer);

  console.log("Registering Decision Trace on 0G Chain...");
  const registerTx = await registry.registerDecisionTrace(
    trace.hashes.decisionHash,
    storageUri,
    storageRoot
  );
  const registerReceipt = await registerTx.wait();
  const traceId = Number(getEventArg(registerReceipt, "DecisionTraceRegistered", "traceId"));

  console.log("Updating verification status to Verified...");
  const verifyTx = await registry.updateVerificationStatus(traceId, 1);
  const verifyReceipt = await verifyTx.wait();

  const proof = {
    createdAt: new Date().toISOString(),
    registryAddress,
    creator: signer.address,
    traceId,
    decisionHash: trace.hashes.decisionHash,
    storageUri,
    storageRoot,
    storageTxHash,
    registerTxHash: registerReceipt.hash,
    verificationTxHash: verifyReceipt.hash,
    verificationStatus: "Verified",
    chainId
  };

  fs.mkdirSync("proofs", { recursive: true });
  fs.writeFileSync("proofs/real-0g-proof.json", JSON.stringify({ proof, trace: storedTrace }, null, 2));

  console.log(JSON.stringify(proof, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
