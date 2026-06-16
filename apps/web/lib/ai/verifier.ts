import { agents, expectedDecisionLabel, tasks } from "@/lib/ai/agent";
import type { DecisionTrace, VerificationResult } from "@/lib/schemas/decision-trace";

function agentByName(name: string) {
  return Object.values(agents).find((agent) => agent.name === name) ?? agents.aegis;
}

function taskByTitle(title: string) {
  return Object.values(tasks).find((task) => task.title === title) ?? tasks["defi-vault"];
}

export function verifyDecision(trace: DecisionTrace): VerificationResult {
  const agent = agentByName(trace.agent.name);
  const task = taskByTitle(trace.task.title);
  const evidenceNames = new Set(trace.evidence.map((item) => item.name));
  const missingEvidence = task.requiredEvidence.filter((name) => !evidenceNames.has(name));

  if (missingEvidence.length > 0) {
    return {
      status: "MissingEvidence",
      replayResult: `Missing required evidence: ${missingEvidence.join(", ")}.`,
      missingEvidence
    };
  }

  const expectedLabel = expectedDecisionLabel(agent, task, trace.evidence);

  if (expectedLabel !== trace.decision.label) {
    return {
      status: "Inconsistent",
      replayResult: `Replay expected ${expectedLabel}, but trace recorded ${trace.decision.label}.`,
      expectedLabel,
      missingEvidence
    };
  }

  return {
    status: "Verified",
    replayResult: `Replay matched ${trace.decision.label} with the same public evidence and config.`,
    expectedLabel,
    missingEvidence
  };
}

export function applyVerification(trace: DecisionTrace): DecisionTrace {
  const result = verifyDecision(trace);
  return {
    ...trace,
    verification: {
      status: result.status,
      replayResult: result.replayResult
    }
  };
}
