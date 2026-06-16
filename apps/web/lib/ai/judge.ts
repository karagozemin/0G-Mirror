import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import type { CourtVerdict } from "@/lib/schemas/court-verdict";
import { tasks } from "@/lib/ai/agent";
import { hashJson } from "@/lib/utils/hash";

function requiredEvidenceFor(trace: DecisionTrace) {
  return Object.values(tasks).find((task) => task.title === trace.task.title)?.requiredEvidence ?? [];
}

function coverage(trace: DecisionTrace) {
  const required = requiredEvidenceFor(trace);
  if (required.length === 0) return 100;
  const present = new Set(trace.evidence.map((item) => item.name));
  return Math.round((required.filter((name) => present.has(name)).length / required.length) * 100);
}

function statusScore(trace: DecisionTrace) {
  if (trace.verification.status === "Verified") return 3;
  if (trace.verification.status === "Pending") return 1;
  return 0;
}

export function runOlympusJudge(traceA: DecisionTrace, traceB: DecisionTrace, claim: string): CourtVerdict {
  const coverageA = coverage(traceA);
  const coverageB = coverage(traceB);
  const scoreA = coverageA + statusScore(traceA) * 20;
  const scoreB = coverageB + statusScore(traceB) * 20;
  const winnerTrace = scoreA >= scoreB ? traceA : traceB;
  const loserTrace = winnerTrace.traceId === traceA.traceId ? traceB : traceA;
  const winner = winnerTrace.agent.name;
  const loser = loserTrace.agent.name;
  const reasonCodes = [
    coverageA !== coverageB ? "better_evidence_coverage" : "equal_evidence_coverage",
    winnerTrace.verification.status === "Verified" ? "verified_replay" : "needs_additional_replay",
    "consistent_rationale"
  ];

  if (
    traceA.decision.label.includes("DO_NOT") ||
    traceA.decision.label.includes("PAUSE") ||
    traceB.decision.label.includes("DO_NOT") ||
    traceB.decision.label.includes("PAUSE")
  ) {
    reasonCodes.push("lower_risk_bias");
  }

  const draft = {
    schema: "0g-mirror/court-verdict/v1" as const,
    caseTitle: `Olympus Appeal: ${traceA.agent.name} vs ${traceB.agent.name}`,
    traceA: traceA.storage?.uri ?? traceA.traceId,
    traceB: traceB.storage?.uri ?? traceB.traceId,
    claim,
    judge: {
      name: "Olympus Judge",
      version: "1.0"
    },
    verdict: {
      winner,
      summary: `${winner} produced the stronger decision trail because it had better evidence coverage and replay status than ${loser}.`,
      reasonCodes,
      evidenceCoverage: {
        traceA: coverageA,
        traceB: coverageB
      },
      verificationStatus: {
        traceA: traceA.verification.status,
        traceB: traceB.verification.status
      }
    },
    hashes: {
      verdictRoot: "0x"
    },
    timestamps: {
      createdAt: new Date().toISOString()
    }
  };

  return {
    ...draft,
    hashes: {
      verdictRoot: hashJson(draft)
    }
  };
}
