"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Crown, Database, Gavel, Loader2, Scale, ShieldCheck, Swords, Trophy, Zap } from "lucide-react";
import { agents, runAgentDecision, type AgentId } from "@/lib/ai/agent";
import { applyVerification } from "@/lib/ai/verifier";
import { runOlympusJudge } from "@/lib/ai/judge";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import type { CourtVerdict } from "@/lib/schemas/court-verdict";
import { shortHash } from "@/lib/utils/hash";
import { saveTrace } from "@/lib/utils/local-store";
import { Button } from "@/components/shared/Buttons";
import { Notice } from "@/components/shared/Notice";
import { Shell } from "@/components/shared/Shell";
import { StatusPill } from "@/components/shared/StatusPill";
import { TraceCard } from "@/components/shared/TraceCard";
import { OperationProgressPanel } from "@/components/shared/OperationProgressPanel";
import { MirrorBackground } from "@/components/fx/MirrorBackground";
import { ExplorerValue } from "@/components/shared/ExplorerValue";
import { txExplorerHref } from "@/lib/0g/explorer";
import {
  ensureRegisteredTrace,
  ensureStoredTrace,
  storeAndAttestVerdict,
  updateTraceStatus
} from "@/components/shared/client-actions";

type BusyState = "start" | "verify" | "appeal" | null;
type AppealPhase = "storage" | "chain" | "judge" | "complete";
type AppealProgress = {
  phase: AppealPhase;
  label: string;
  detail: string;
  step: number;
  percent: number;
};

const APPEAL_STEP_TOTAL = 8;

const agentStyles: Record<AgentId, { gradient: string; border: string; text: string }> = {
  aegis: { gradient: "from-beam/20 to-beam/5", border: "border-beam/40", text: "text-beam" },
  nyx: { gradient: "from-danger/20 to-danger/5", border: "border-danger/40", text: "text-danger" },
  hermes: { gradient: "from-mint/20 to-mint/5", border: "border-mint/40", text: "text-mint" }
};

export function ArenaClient() {
  const [agentA, setAgentA] = useState<AgentId>("aegis");
  const [agentB, setAgentB] = useState<AgentId>("nyx");
  const [traceA, setTraceA] = useState<DecisionTrace | null>(null);
  const [traceB, setTraceB] = useState<DecisionTrace | null>(null);
  const [verdict, setVerdict] = useState<CourtVerdict | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [battling, setBattling] = useState(false);
  const [appealProgress, setAppealProgress] = useState<AppealProgress | null>(null);
  const hasBothTraces = Boolean(traceA && traceB);
  const hasVerifiedBoth = Boolean(
    traceA?.verification.status === "Verified" && traceB?.verification.status === "Verified"
  );

  function setAppealStep(step: number, phase: AppealPhase, label: string, detail: string) {
    setAppealProgress({
      phase,
      label,
      detail,
      step,
      percent: Math.min(92, Math.round((step / APPEAL_STEP_TOTAL) * 92))
    });
  }

  function startBattle() {
    if (agentA === agentB) return;
    setBusy("start");
    setNotice(null);
    setBattling(true);
    setVerdict(null);
    setAppealProgress(null);

    setTimeout(() => {
      const nextA = runAgentDecision(agentA, "defi-vault");
      const nextB = runAgentDecision(agentB, "defi-vault");
      saveTrace(nextA);
      saveTrace(nextB);
      setTraceA(nextA);
      setTraceB(nextB);
      setBattling(false);
      setBusy(null);
    }, 800);
  }

  async function verifyBoth() {
    if (!traceA || !traceB) return;
    setBusy("verify");
    setAppealProgress(null);
    const verifiedA = applyVerification(traceA);
    const verifiedB = applyVerification(traceB);
    const updatedA = await updateTraceStatus(verifiedA);
    const updatedB = await updateTraceStatus(verifiedB);
    setTraceA(updatedA.trace);
    setTraceB(updatedB.trace);
    setNotice(updatedA.notice ?? updatedB.notice ?? "Both decisions replayed. Appeal to Olympus unlocked.");
    setBusy(null);
  }

  async function appeal() {
    if (!traceA || !traceB) return;
    if (!hasVerifiedBoth) {
      setNotice("Verify Both Traces first, then Appeal to Olympus.");
      return;
    }
    setBusy("appeal");
    setNotice(null);
    setAppealStep(1, "storage", "Preparing 0G Storage payloads", "Checking both traces before upload.");

    try {
      let nextNotice: string | null = null;
      const rememberNotice = (value: string | null) => {
        nextNotice = nextNotice ?? value;
      };

      const verifiedA = traceA.verification.status === "Pending" ? applyVerification(traceA) : traceA;
      const verifiedB = traceB.verification.status === "Pending" ? applyVerification(traceB) : traceB;

      setAppealStep(2, "storage", "0G Storage: challenger trace", "Uploading Trace A evidence and hashes.");
      const storedA = await ensureStoredTrace(verifiedA);
      rememberNotice(storedA.notice);

      setAppealStep(3, "chain", "0G Chain: challenger attestation", "Waiting for Trace A registration confirmation.");
      const registeredA = await ensureRegisteredTrace(storedA.trace);
      rememberNotice(registeredA.notice);

      setAppealStep(4, "storage", "0G Storage: defender trace", "Uploading Trace B evidence and hashes.");
      const storedB = await ensureStoredTrace(verifiedB);
      rememberNotice(storedB.notice);

      setAppealStep(5, "chain", "0G Chain: defender attestation", "Waiting for Trace B registration confirmation.");
      const registeredB = await ensureRegisteredTrace(storedB.trace);
      rememberNotice(registeredB.notice);

      setAppealStep(6, "judge", "Olympus Judge", "Comparing evidence coverage and replay status.");
      const claim = "Trace B ignored critical risk evidence.";
      const nextVerdict = runOlympusJudge(registeredA.trace, registeredB.trace, claim);

      const attestedVerdict = await storeAndAttestVerdict(
        nextVerdict,
        registeredA.trace,
        registeredB.trace,
        (phase) => {
          if (phase === "storage") {
            setAppealStep(7, "storage", "0G Storage: court verdict", "Uploading the Olympus verdict record.");
          }
          if (phase === "chain") {
            setAppealStep(8, "chain", "0G Chain: verdict attestation", "Waiting for verdict registration confirmation.");
          }
        }
      );

      setAppealProgress({
        phase: "complete",
        label: "Olympus verdict attested",
        detail: "0G Storage URI and chain attestation are ready.",
        step: APPEAL_STEP_TOTAL,
        percent: 100
      });
      setTraceA(registeredA.trace);
      setTraceB(registeredB.trace);
      setVerdict(attestedVerdict.verdict);
      setNotice(attestedVerdict.notice ?? nextNotice ?? "Olympus verdict attested.");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Olympus appeal failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Shell>
      {/* Arena Header */}
      <section className="relative overflow-hidden border-b border-line">
        <MirrorBackground variant="arena" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/80 to-ink" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/8 px-4 py-1.5">
                <Swords className="h-3.5 w-3.5 text-gold" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-gold">Live Demo Mode</span>
              </div>
              <h1 className="mt-5 font-display text-5xl font-bold text-white sm:text-6xl">
                Olympus <span className="text-gold-glow text-gold">Arena</span>
              </h1>
              <p className="mt-3 max-w-xl text-silver/65">
                Two agents. One challenge. Mirror records both Decision Traces. Olympus judges the appeal with public evidence.
              </p>
            </div>
            <div className="glass-gold rounded-2xl px-6 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/60">Challenge</p>
              <p className="mt-1 font-display text-lg font-bold text-white">Should this DeFi vault be trusted?</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {notice ? (
          <div className="mb-6">
            <Notice variant={notice.includes("Local") ? "warn" : "success"}>{notice}</Notice>
          </div>
        ) : null}

        {/* Battle Setup */}
        <div className="glass rounded-2xl p-6">
          <div className="grid items-end gap-4 lg:grid-cols-[1fr_auto_1fr_auto]">
            <AgentSelect label="Challenger" value={agentA} onChange={setAgentA} side="left" />
            <div className="flex justify-center pb-2">
              <motion.div
                animate={battling ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.6 }}
                className="vs-badge flex h-14 w-14 items-center justify-center rounded-full"
              >
                <span className="font-display text-lg font-black text-gold">VS</span>
              </motion.div>
            </div>
            <AgentSelect label="Defender" value={agentB} onChange={setAgentB} side="right" />
            <Button
              onClick={startBattle}
              loading={busy === "start"}
              disabled={agentA === agentB || busy !== null}
              variant="gold"
              size="lg"
            >
              <Zap className="h-4 w-4" />
              Start Battle
            </Button>
          </div>
          {agentA === agentB ? (
            <p className="mt-3 text-center text-sm text-danger/80">Select two different agents to battle.</p>
          ) : null}
        </div>

        {/* Battle Arena */}
        <div className="relative mt-8">
          {battling ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-ink/80 backdrop-blur-sm"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mx-auto h-12 w-12 rounded-full border-2 border-gold/30 border-t-gold"
                />
                <p className="mt-4 font-display text-lg font-bold text-gold">Agents deciding…</p>
              </div>
            </motion.div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <AnimatePresence mode="wait">
              {traceA ? (
                <motion.div key="a" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                  <TraceCard trace={traceA} compact />
                </motion.div>
              ) : (
                <EmptySeat key="empty-a" agentId={agentA} side="left" />
              )}
            </AnimatePresence>
            <AnimatePresence mode="wait">
              {traceB ? (
                <motion.div key="b" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <TraceCard trace={traceB} compact />
                </motion.div>
              ) : (
                <EmptySeat key="empty-b" agentId={agentB} side="right" />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 glass rounded-2xl p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={verifyBoth} loading={busy === "verify"} disabled={!hasBothTraces || busy !== null}>
              <ShieldCheck className="h-4 w-4" />
              Verify Both Traces
            </Button>
            <Button
              onClick={appeal}
              loading={busy === "appeal"}
              disabled={!hasBothTraces || !hasVerifiedBoth || busy !== null}
              variant="gold"
              title={!hasVerifiedBoth ? "Verify Both Traces first" : undefined}
            >
              <Gavel className="h-4 w-4" />
              Appeal to Olympus
            </Button>
          </div>
          <p className="mt-3 text-sm text-silver/45">
            Step order: verify both traces first, then open the appeal.
          </p>
          <AnimatePresence>{appealProgress ? <OperationProgressPanel progress={appealProgress} totalSteps={APPEAL_STEP_TOTAL} /> : null}</AnimatePresence>
        </div>

        {/* Verdict */}
        <AnimatePresence>
          {verdict ? (
            <motion.div
              initial={{ opacity: 0, y: 32, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <VerdictCard verdict={verdict} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </Shell>
  );
}

function AgentSelect({
  label,
  value,
  onChange,
  side
}: {
  label: string;
  value: AgentId;
  onChange: (value: AgentId) => void;
  side: "left" | "right";
}) {
  const style = agentStyles[value];

  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-silver/40">{label}</span>
      <div className={`mt-2 flex items-center gap-3 rounded-xl border bg-gradient-to-br ${style.gradient} ${style.border} p-3`}>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border bg-black/30 text-lg font-bold ${style.text} ${style.border}`}>
          {agents[value].name[0]}
        </div>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as AgentId)}
          className="flex-1 bg-transparent text-sm font-bold text-white outline-none"
        >
          {Object.values(agents).map((agent) => (
            <option key={agent.id} value={agent.id} className="bg-void">
              {agent.name} — {agent.role}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function EmptySeat({ agentId, side }: { agentId: AgentId; side: "left" | "right" }) {
  const style = agentStyles[agentId];
  const agent = agents[agentId];

  return (
    <motion.div
      initial={{ opacity: 0, x: side === "left" ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`glass flex min-h-[280px] items-center justify-center rounded-2xl border-dashed p-6 text-center ${style.border}`}
    >
      <div>
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border bg-gradient-to-br text-2xl font-bold ${style.gradient} ${style.text} ${style.border}`}>
          {agent.name[0]}
        </div>
        <p className="mt-4 font-display font-bold text-white">{agent.name}</p>
        <p className="mt-1 text-sm text-silver/45">Waiting for battle…</p>
        <Scale className="mx-auto mt-4 h-6 w-6 text-silver/20" />
      </div>
    </motion.div>
  );
}

function VerdictCard({ verdict }: { verdict: CourtVerdict }) {
  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-gold/30 shadow-glow-gold">
      <div className="relative border-b border-line bg-gradient-to-r from-gold/10 via-void to-gold/5 p-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(251,191,36,0.08),transparent_60%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-gold" />
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-gold/70">Olympus Court Verdict</p>
            </div>
            <h2 className="mt-2 font-display text-3xl font-bold text-white">{verdict.caseTitle}</h2>
          </div>
          <StatusPill status={verdict.attestation?.mode === "0g" ? "OnChain" : "Local"} />
        </div>
      </div>

      <div className="grid gap-5 bg-void/50 p-6 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/40 bg-gold/10">
              <Crown className="h-7 w-7 text-gold" />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold/60">Winner</p>
              <p className="font-display text-4xl font-black text-white">{verdict.verdict.winner}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-relaxed text-silver/75">{verdict.verdict.summary}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <VerdictMetric label="Evidence coverage A" value={`${verdict.verdict.evidenceCoverage.traceA}%`} />
          <VerdictMetric label="Evidence coverage B" value={`${verdict.verdict.evidenceCoverage.traceB}%`} />
          <VerdictMetric label="Verification A" value={verdict.verdict.verificationStatus.traceA} />
          <VerdictMetric label="Verification B" value={verdict.verdict.verificationStatus.traceB} />
          <VerdictMetric label="0G Storage URI" value={verdict.storage?.uri ?? "pending"} wide />
          <VerdictMetric
            label="Storage tx"
            value={shortHash(verdict.storage?.txHash ?? "pending", 8)}
            href={txExplorerHref(verdict.storage?.txHash, verdict.attestation?.chainId)}
          />
          <VerdictMetric label="Attestation ID" value={String(verdict.attestation?.verdictId ?? "pending")} />
          <VerdictMetric
            label="Attestation tx"
            value={shortHash(verdict.attestation?.txHash ?? "pending", 8)}
            href={txExplorerHref(verdict.attestation?.txHash, verdict.attestation?.chainId)}
          />
          <VerdictMetric label="Verdict root" value={shortHash(verdict.hashes.verdictRoot, 8)} />
        </div>
      </div>

      <div className="border-t border-line bg-black/20 px-6 py-4">
        <Database className="mr-2 inline h-4 w-4 text-gold/70" />
        <span className="text-sm text-silver/60">Claim reviewed: </span>
        <span className="text-sm font-medium text-white">{verdict.claim}</span>
      </div>
    </div>
  );
}

function VerdictMetric({
  label,
  value,
  wide = false,
  href
}: {
  label: string;
  value: string;
  wide?: boolean;
  href?: string;
}) {
  return (
    <div className={`min-w-0 rounded-xl border border-line/60 bg-black/20 p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-silver/40">{label}</p>
      {href ? (
        <div className="mt-1">
          <ExplorerValue href={href} title={value} className="w-full justify-between px-2 py-1.5">
            {value}
          </ExplorerValue>
        </div>
      ) : (
        <p className="mt-1 truncate font-mono text-sm font-semibold text-white" title={value}>
          {value}
        </p>
      )}
    </div>
  );
}
