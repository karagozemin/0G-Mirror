import type { DecisionTrace, EvidenceItem } from "@/lib/schemas/decision-trace";
import { computeDecisionHashes } from "@/lib/utils/hash";
import { createLocalId } from "@/lib/utils/ids";

export type AgentId = "aegis" | "nyx" | "hermes";
export type TaskId = "defi-vault" | "grant-allocation" | "exploit-triage";

export type AgentConfig = {
  id: AgentId;
  name: string;
  role: string;
  version: string;
  riskPosture: "cautious" | "aggressive" | "fast";
  temperature: number;
  toolsUsed: string[];
};

export type TaskConfig = {
  id: TaskId;
  title: string;
  input: string;
  context: string[];
  requiredEvidence: string[];
  evidence: EvidenceItem[];
};

export const agents: Record<AgentId, AgentConfig> = {
  aegis: {
    id: "aegis",
    name: "Aegis",
    role: "DeFi Risk Analyst",
    version: "1.0",
    riskPosture: "cautious",
    temperature: 0.2,
    toolsUsed: ["risk_scoring", "evidence_check", "admin_key_review"]
  },
  nyx: {
    id: "nyx",
    name: "Nyx",
    role: "Aggressive Yield Strategist",
    version: "1.0",
    riskPosture: "aggressive",
    temperature: 0.55,
    toolsUsed: ["yield_projection", "risk_scoring"]
  },
  hermes: {
    id: "hermes",
    name: "Hermes",
    role: "Fast Execution Agent",
    version: "1.0",
    riskPosture: "fast",
    temperature: 0.35,
    toolsUsed: ["fast_path_check", "evidence_check"]
  }
};

export const tasks: Record<TaskId, TaskConfig> = {
  "defi-vault": {
    id: "defi-vault",
    title: "DeFi Vault Risk Decision",
    input: "Should this vault be trusted?",
    context: ["TVL: $2.4M", "Audit: none", "APY: 480%", "Admin key: upgradeable"],
    requiredEvidence: ["TVL", "Audit", "APY", "Admin key"],
    evidence: [
      { type: "metric", name: "TVL", value: "$2.4M" },
      { type: "security", name: "Audit", value: "none" },
      { type: "metric", name: "APY", value: "480%" },
      { type: "security", name: "Admin key", value: "upgradeable" }
    ]
  },
  "grant-allocation": {
    id: "grant-allocation",
    title: "Grant Allocation Decision",
    input: "Should this agent team receive a growth grant?",
    context: [
      "Requested budget: $85K",
      "Milestones: partially specified",
      "Prior delivery: 2 shipped pilots",
      "Community signal: high"
    ],
    requiredEvidence: ["Requested budget", "Milestones", "Prior delivery", "Community signal"],
    evidence: [
      { type: "finance", name: "Requested budget", value: "$85K" },
      { type: "planning", name: "Milestones", value: "partially specified" },
      { type: "track_record", name: "Prior delivery", value: "2 shipped pilots" },
      { type: "social", name: "Community signal", value: "high" }
    ]
  },
  "exploit-triage": {
    id: "exploit-triage",
    title: "Smart Contract Exploit Triage",
    input: "Should the protocol pause immediately?",
    context: [
      "Exploit reproducibility: confirmed",
      "Funds at risk: $6.8M",
      "Patch availability: not ready",
      "Oracle anomaly: active"
    ],
    requiredEvidence: ["Exploit reproducibility", "Funds at risk", "Patch availability", "Oracle anomaly"],
    evidence: [
      { type: "security", name: "Exploit reproducibility", value: "confirmed" },
      { type: "metric", name: "Funds at risk", value: "$6.8M" },
      { type: "engineering", name: "Patch availability", value: "not ready" },
      { type: "security", name: "Oracle anomaly", value: "active" }
    ]
  }
};

function selectEvidenceForAgent(agent: AgentConfig, task: TaskConfig) {
  if (agent.id === "nyx" && task.id === "defi-vault") {
    return task.evidence.filter((item) => item.name !== "Audit");
  }

  if (agent.id === "hermes") {
    return task.evidence.slice(0, 3);
  }

  return task.evidence;
}

function numeric(value: string) {
  const match = value.replaceAll(",", "").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

export function scoreEvidence(agent: AgentConfig, task: TaskConfig, evidence: EvidenceItem[]) {
  const byName = new Map(evidence.map((item) => [item.name, item.value.toLowerCase()]));
  let risk = 0;
  let opportunity = 0;

  if (task.id === "defi-vault") {
    const apy = numeric(byName.get("APY") ?? "0");
    if (apy > 100) risk += 28;
    if (apy > 300) risk += 24;
    opportunity += Math.min(34, apy / 16);
    if ((byName.get("Audit") ?? "").includes("none")) risk += 34;
    if ((byName.get("Admin key") ?? "").includes("upgradeable")) risk += 24;
    if (numeric(byName.get("TVL") ?? "0") < 5) risk += 8;
  }

  if (task.id === "grant-allocation") {
    if ((byName.get("Milestones") ?? "").includes("partially")) risk += 22;
    if (numeric(byName.get("Requested budget") ?? "0") > 75) risk += 16;
    if ((byName.get("Prior delivery") ?? "").includes("shipped")) opportunity += 28;
    if ((byName.get("Community signal") ?? "").includes("high")) opportunity += 24;
  }

  if (task.id === "exploit-triage") {
    if ((byName.get("Exploit reproducibility") ?? "").includes("confirmed")) risk += 35;
    if (numeric(byName.get("Funds at risk") ?? "0") > 1) risk += 28;
    if ((byName.get("Patch availability") ?? "").includes("not ready")) risk += 22;
    if ((byName.get("Oracle anomaly") ?? "").includes("active")) risk += 18;
  }

  if (agent.riskPosture === "cautious") risk += 10;
  if (agent.riskPosture === "aggressive") opportunity += 18;
  if (agent.riskPosture === "fast") risk += 4;

  return {
    risk: Math.min(100, Math.round(risk)),
    opportunity: Math.min(100, Math.round(opportunity)),
    coverage: Math.round((evidence.length / task.requiredEvidence.length) * 100)
  };
}

export function expectedDecisionLabel(agent: AgentConfig, task: TaskConfig, evidence: EvidenceItem[]) {
  const score = scoreEvidence(agent, task, evidence);

  if (task.id === "defi-vault") {
    if (agent.riskPosture === "aggressive" && score.opportunity >= 40 && score.risk < 90) {
      return "INVEST_WITH_LIMITS";
    }
    return score.risk >= 62 ? "DO_NOT_INVEST" : "TRUST_WITH_MONITORING";
  }

  if (task.id === "grant-allocation") {
    if (score.opportunity >= 45 && score.risk < 34) return "APPROVE_GRANT";
    if (score.opportunity >= 35) return "APPROVE_WITH_MILESTONES";
    return "REQUEST_MORE_EVIDENCE";
  }

  if (score.risk >= 70) return "PAUSE_PROTOCOL";
  if (score.risk >= 40) return "ESCALATE_SECURITY_REVIEW";
  return "MONITOR_ONLY";
}

function decisionText(label: string, task: TaskConfig, score: ReturnType<typeof scoreEvidence>) {
  const outputs: Record<string, { output: string; publicRationale: string }> = {
    DO_NOT_INVEST: {
      output: "The vault is too risky.",
      publicRationale:
        "The APY is unusually high, audit evidence is weak or missing, and admin key risk is material."
    },
    TRUST_WITH_MONITORING: {
      output: "The vault may be used with active monitoring.",
      publicRationale:
        "The evidence does not cross the risk threshold, but ongoing monitoring is still required."
    },
    INVEST_WITH_LIMITS: {
      output: "The yield opportunity can be tested with strict limits.",
      publicRationale:
        "The APY signal is strong, but risk controls are necessary because the evidence coverage is incomplete."
    },
    APPROVE_GRANT: {
      output: "Approve the grant.",
      publicRationale:
        "Delivery history and community signal outweigh the remaining execution risk."
    },
    APPROVE_WITH_MILESTONES: {
      output: "Approve only with milestone-based release.",
      publicRationale:
        "The team has traction, but budget and milestone evidence require tighter accountability."
    },
    REQUEST_MORE_EVIDENCE: {
      output: "Request more evidence before funding.",
      publicRationale:
        "The decision needs clearer milestones, budget support, or delivery proof."
    },
    PAUSE_PROTOCOL: {
      output: "Pause the protocol immediately.",
      publicRationale:
        "The exploit is reproducible, funds are at risk, and no patch is ready."
    },
    ESCALATE_SECURITY_REVIEW: {
      output: "Escalate to security review.",
      publicRationale:
        "The risk is significant enough to require expert review before normal operation continues."
    },
    MONITOR_ONLY: {
      output: "Continue monitoring.",
      publicRationale:
        "The available evidence does not justify emergency action."
    }
  };

  return (
    outputs[label] ?? {
      output: `Decision for ${task.title}: ${label}.`,
      publicRationale: `Replay score: risk ${score.risk}, opportunity ${score.opportunity}, coverage ${score.coverage}%.`
    }
  );
}

export function runAgentDecision(agentId: AgentId, taskId: TaskId): DecisionTrace {
  const agent = agents[agentId];
  const task = tasks[taskId];
  const evidence = selectEvidenceForAgent(agent, task);
  const score = scoreEvidence(agent, task, evidence);
  const label = expectedDecisionLabel(agent, task, evidence);
  const decision = decisionText(label, task, score);

  const traceWithoutHashes = {
    schema: "0g-mirror/decision-trace/v1" as const,
    traceId: createLocalId("trace"),
    agent: {
      name: agent.name,
      role: agent.role,
      version: agent.version
    },
    task: {
      title: task.title,
      input: task.input,
      context: task.context
    },
    model: {
      provider: "adapter",
      model: "deterministic-risk-v1",
      temperature: agent.temperature,
      seed: `${agent.id}:${task.id}:olympus`
    },
    toolsUsed: agent.toolsUsed,
    decision: {
      label,
      output: decision.output,
      publicRationale: decision.publicRationale
    },
    evidence,
    verification: {
      status: "Pending" as const,
      replayResult: null
    },
    timestamps: {
      createdAt: new Date().toISOString()
    }
  };

  return {
    ...traceWithoutHashes,
    hashes: computeDecisionHashes(traceWithoutHashes)
  };
}
