"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ChevronRight,
  Database,
  FileJson,
  Network,
  Play,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { agents, runAgentDecision, tasks, type AgentId, type TaskId } from "@/lib/ai/agent";
import { applyVerification } from "@/lib/ai/verifier";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { saveTrace } from "@/lib/utils/local-store";
import { Button } from "@/components/shared/Buttons";
import { Notice } from "@/components/shared/Notice";
import { Shell } from "@/components/shared/Shell";
import { TraceCard } from "@/components/shared/TraceCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { OperationProgressPanel, type OperationProgressState } from "@/components/shared/OperationProgressPanel";
import { MirrorBackground } from "@/components/fx/MirrorBackground";
import { ensureStoredTrace, ensureRegisteredTrace, updateTraceStatus } from "@/components/shared/client-actions";
import { formatWalletError } from "@/lib/wallet/errors";
import { useWalletPipeline } from "@/lib/wallet/use-wallet-pipeline";

type BusyState = "run" | "store" | "register" | "verify" | null;
const RUN_DECISION_DELAY_MS = 2400;
const TRACE_OPERATION_STEP_TOTAL = 3;

type TraceOperationPhase = "storage" | "chain" | "verify" | "complete";

const pipeline = [
  { id: "select", label: "Select" },
  { id: "decide", label: "Decide" },
  { id: "store", label: "Store" },
  { id: "register", label: "Register" },
  { id: "verify", label: "Verify" }
] as const;

const agentColors: Record<AgentId, string> = {
  aegis: "agent-aegis",
  nyx: "agent-nyx",
  hermes: "agent-hermes"
};

export function MirrorClient() {
  const [agentId, setAgentId] = useState<AgentId>("aegis");
  const [taskId, setTaskId] = useState<TaskId>("defi-vault");
  const [trace, setTrace] = useState<DecisionTrace | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeVariant, setNoticeVariant] = useState<"warn" | "success" | "info">("success");
  const [operationProgress, setOperationProgress] = useState<OperationProgressState | null>(null);
  const { ensureConnected, wrongNetwork } = useWalletPipeline();

  const selectedAgent = agents[agentId];
  const selectedTask = tasks[taskId];
  const context = useMemo(() => selectedTask.context.join(" · "), [selectedTask]);
  const hasStoredTrace = Boolean(trace?.storage?.uri);
  const hasRegisteredTrace = Boolean(trace?.attestation?.traceId);
  const isVerified = trace?.verification.status === "Verified";
  const workflowHint = !trace
    ? "Run Decision first"
    : !hasStoredTrace
      ? "Step 1 of 3: Store on 0G"
      : !hasRegisteredTrace
        ? "Step 2 of 3: Register On-chain"
        : !isVerified
          ? "Step 3 of 3: Verify Decision"
          : "Workflow complete";

  const activeStep = busy === "run"
    ? "decide"
    : !trace
    ? "select"
    : !trace.storage?.uri
      ? "decide"
      : !trace.attestation?.traceId
        ? "store"
        : trace.verification.status === "Pending"
          ? "register"
          : "verify";

  function setOperationStep(step: number, phase: TraceOperationPhase, label: string, detail: string) {
    setOperationProgress({
      phase,
      label,
      detail,
      step,
      percent: Math.min(100, Math.round((step / TRACE_OPERATION_STEP_TOTAL) * 100))
    });
  }

  async function runDecision() {
    const currentAgentId = agentId;
    const currentTaskId = taskId;
    setBusy("run");
    setNotice(null);
    setOperationProgress(null);
    await new Promise((resolve) => setTimeout(resolve, RUN_DECISION_DELAY_MS));
    const nextTrace = runAgentDecision(currentAgentId, currentTaskId);
    saveTrace(nextTrace);
    setTrace(nextTrace);
    setBusy(null);
  }

  function showNotice(message: string, variant: "warn" | "success" | "info" = "success") {
    setNotice(message);
    setNoticeVariant(variant);
  }

  async function storeTrace() {
    if (!trace) return;
    if (hasStoredTrace) {
      showNotice("Store on 0G already completed. Continue with Register On-chain.", "info");
      return;
    }
    try {
      ensureConnected();
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      return;
    }
    if (wrongNetwork) {
      showNotice("Switch to 0G Galileo Testnet in your wallet, then try again.", "warn");
    }

    setBusy("store");
    setNotice(null);
    setOperationStep(1, "storage", "Preparing 0G Storage payload", "Serializing the decision trace and evidence bundle.");
    setOperationStep(2, "storage", "Confirm in wallet", "Approve the 0G Storage upload transaction in your wallet.");
    try {
      const result = await ensureStoredTrace(trace);
      if (result.notice) {
        showNotice(result.notice, "warn");
        setOperationProgress(null);
        setBusy(null);
        return;
      }
      setTrace(result.trace);
      setOperationStep(3, "complete", "Storage recorded", "Decision trace is available in 0G Storage.");
      showNotice("Stored on 0G Storage.", "success");
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      setOperationProgress(null);
    }
    setBusy(null);
  }

  async function registerTrace() {
    if (!trace) return;
    if (!hasStoredTrace) {
      showNotice("Store on 0G first, then register the trace on-chain.", "warn");
      return;
    }
    if (hasRegisteredTrace) {
      showNotice("Register On-chain already completed. Continue with Verify Decision.", "info");
      return;
    }
    try {
      ensureConnected();
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      return;
    }

    setBusy("register");
    setNotice(null);
    setOperationStep(1, "chain", "Preparing chain attestation", "Reading the storage URI and trace root.");
    setOperationStep(2, "chain", "Confirm in wallet", "Approve registerDecisionTrace in your wallet.");
    try {
      const result = await ensureRegisteredTrace(trace);
      if (result.notice) {
        showNotice(result.notice, "warn");
        setOperationProgress(null);
        setBusy(null);
        return;
      }
      setTrace(result.trace);
      setOperationStep(3, "complete", "Attestation ready", "Trace ID and tx hash are recorded on-chain.");
      showNotice(`Registered on-chain. Trace ID: ${result.trace.attestation?.traceId}.`, "success");
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      setOperationProgress(null);
    }
    setBusy(null);
  }

  async function verifyTrace() {
    if (!trace) return;
    if (!hasRegisteredTrace) {
      showNotice("Register On-chain first, then verify the decision.", "warn");
      return;
    }
    if (isVerified) {
      showNotice("Decision already verified.", "info");
      return;
    }
    try {
      ensureConnected();
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      return;
    }

    setBusy("verify");
    setNotice(null);
    setOperationStep(1, "verify", "Replaying decision", "Applying the verifier to the current trace.");
    setOperationStep(2, "verify", "Confirm in wallet", "Approve updateVerificationStatus in your wallet.");
    try {
      const verified = applyVerification(trace);
      const result = await updateTraceStatus(verified);
      if (result.notice) {
        showNotice(result.notice, "warn");
        setOperationProgress(null);
        setBusy(null);
        return;
      }
      setTrace(result.trace);
      setOperationStep(
        3,
        "complete",
        "Replay complete",
        `Verification status: ${result.trace.verification.status}.`
      );
      showNotice(`Verified on-chain: ${result.trace.verification.status}.`, "success");
    } catch (error) {
      showNotice(formatWalletError(error), "warn");
      setOperationProgress(null);
    }

    setBusy(null);
  }

  return (
    <Shell>
      {/* Header */}
      <section className="relative overflow-hidden border-b border-line">
        <MirrorBackground variant="subtle" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.28em] text-beam/70">0G Mirror Core</p>
              <h1 className="mt-3 font-display text-4xl font-bold text-white sm:text-5xl">
                Create a Decision Trace
              </h1>
              <p className="mt-3 max-w-xl text-silver/60">
                Select an agent, run a decision, store on 0G, register on-chain, verify by replay.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {trace?.storage?.mode === "0g" ? <StatusPill status="OnChain" /> : null}
              {trace?.storage?.mode === "local" ? <StatusPill status="Local" /> : null}
            </div>
          </div>

          {/* Pipeline */}
          <div className="mt-8 flex items-center gap-1 overflow-x-auto pb-1">
            {pipeline.map((step, i) => {
              const stepIndex = pipeline.findIndex((s) => s.id === activeStep);
              const currentIndex = pipeline.findIndex((s) => s.id === step.id);
              const done = currentIndex < stepIndex || (step.id === "verify" && trace?.verification.status === "Verified");
              const active = step.id === activeStep;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`pipeline-step flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                      done
                        ? "done border-mint/40 bg-mint/10 text-mint"
                        : active
                          ? "active border-beam/40 bg-beam/10 text-beam"
                          : "border-line bg-white/[0.02] text-silver/40"
                    }`}
                  >
                    <span className={`step-dot h-2 w-2 rounded-full ${done ? "bg-mint" : active ? "bg-beam" : "bg-silver/20"}`} />
                    {step.label}
                  </div>
                  {i < pipeline.length - 1 ? (
                    <ChevronRight className="mx-1 h-4 w-4 shrink-0 text-silver/20" />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {notice ? (
          <div className="mb-6">
            <Notice variant={noticeVariant}>{notice}</Notice>
          </div>
        ) : null}

        <div className="mb-6 glass rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-silver/40">Selected run</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-beam/25 bg-beam/10 px-3 py-1 text-sm font-semibold text-beam">
                  {selectedAgent.name}
                </span>
                <ChevronRight className="h-4 w-4 text-silver/25" />
                <span className="rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-sm font-semibold text-gold">
                  {selectedTask.title}
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-silver/60">{context}</p>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-silver/45">{workflowHint}</p>
            <Button
              onClick={runDecision}
              loading={busy === "run"}
              disabled={busy !== null}
              variant="primary"
              size="lg"
              className="w-full lg:w-auto lg:min-w-[260px]"
            >
              <Play className="h-4 w-4" />
              Run Decision
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          {/* Left: Controls */}
          <div className="space-y-5">
            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-silver/45">
                <ShieldCheck className="h-4 w-4 text-beam" />
                Choose Agent
              </div>
              <div className="mt-4 grid gap-3">
                {Object.values(agents).map((agent) => (
                  <motion.button
                    key={agent.id}
                    onClick={() => setAgentId(agent.id)}
                    disabled={busy !== null}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className={`agent-card ${agentColors[agent.id]} rounded-xl p-4 text-left disabled:cursor-not-allowed disabled:opacity-55 ${agentId === agent.id ? "selected" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-current/30 bg-current/10 text-lg font-bold text-current">
                        {agent.name[0]}
                      </div>
                      <div>
                        <span className="font-display font-bold text-white">{agent.name}</span>
                        <span className="mt-0.5 block text-sm text-silver/55">{agent.role}</span>
                      </div>
                      {agentId === agent.id ? (
                        <Sparkles className="ml-auto h-4 w-4 text-current opacity-70" />
                      ) : null}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-silver/45">
                <FileJson className="h-4 w-4 text-gold" />
                Choose Task
              </div>
              <div className="mt-4 grid gap-3">
                {Object.values(tasks).map((task) => (
                  <motion.button
                    key={task.id}
                    onClick={() => setTaskId(task.id)}
                    disabled={busy !== null}
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className={`rounded-xl border p-4 text-left transition-all duration-300 ${
                      taskId === task.id
                        ? "border-gold/50 bg-gold/8 shadow-glow-gold"
                        : "border-line bg-white/[0.02] hover:border-gold/25 hover:bg-white/[0.04]"
                    } disabled:cursor-not-allowed disabled:opacity-55`}
                  >
                    <span className="font-display font-bold text-white">{task.title}</span>
                    <span className="mt-1 block text-sm text-silver/55">{task.input}</span>
                  </motion.button>
                ))}
              </div>
            </div>

          </div>

          {/* Right: Trace output */}
          <div className="space-y-5">
            <AnimatePresence mode="wait">
              {busy === "run" ? (
                <DecisionLoadingCard agentName={selectedAgent.name} taskTitle={selectedTask.title} />
              ) : trace ? (
                <motion.div
                  key={trace.traceId}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-5"
                >
                  <TraceCard trace={trace} />
                  <div className="glass rounded-2xl p-5">
                    <div className="grid gap-3 sm:grid-cols-3">
                        <Button onClick={storeTrace} loading={busy === "store"} disabled={busy !== null || !trace || hasStoredTrace}>
                        <Database className="h-4 w-4" />
                          1. Store on 0G
                      </Button>
                        <Button onClick={registerTrace} loading={busy === "register"} disabled={busy !== null || !trace || !hasStoredTrace || hasRegisteredTrace}>
                        <Network className="h-4 w-4" />
                          2. Register On-chain
                      </Button>
                        <Button onClick={verifyTrace} loading={busy === "verify"} disabled={busy !== null || !trace || !hasRegisteredTrace || isVerified} variant="primary">
                        <CheckCircle2 className="h-4 w-4" />
                          3. Verify Decision
                      </Button>
                    </div>
                    <AnimatePresence>{operationProgress ? <OperationProgressPanel progress={operationProgress} totalSteps={TRACE_OPERATION_STEP_TOTAL} /> : null}</AnimatePresence>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-silver/45">
                      <span className="font-mono text-xs">Stored · Verified · Attested</span>
                      <Link href={`/verify/${trace.traceId}`} className="font-semibold text-beam transition hover:text-beam/75">
                        Open verifier →
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass flex min-h-[580px] items-center justify-center rounded-2xl p-8 text-center"
                >
                  <div>
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-beam/30 bg-beam/10"
                    >
                      <FileJson className="h-7 w-7 text-beam" />
                    </motion.div>
                    <h2 className="mt-6 font-display text-2xl font-bold text-white">Awaiting decision</h2>
                    <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-silver/55">
                      Select an agent and task, then run a decision to generate the auditable payload Mirror stores and attests.
                    </p>
                    <p className="mt-4 font-mono text-xs text-silver/30">
                      {selectedAgent.name} · {selectedTask.title}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function DecisionLoadingCard({ agentName, taskTitle }: { agentName: string; taskTitle: string }) {
  return (
    <motion.div
      key="running"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="glass flex min-h-[580px] items-center justify-center rounded-2xl p-8 text-center"
    >
      <div>
        <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-2 border-beam/10 border-t-beam border-r-beam shadow-[0_0_34px_rgba(168,85,247,0.18)]"
          />
          <motion.div
            animate={{ scale: [0.88, 1.04, 0.88], opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 1.7, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-16 w-16 items-center justify-center rounded-full border border-beam/30 bg-beam/10"
          >
            <FileJson className="h-7 w-7 text-beam" />
          </motion.div>
        </div>
        <h2 className="mt-6 font-display text-2xl font-bold text-white">Generating Decision Trace</h2>
        <p className="mt-3 font-mono text-xs text-silver/35">
          {agentName} · {taskTitle}
        </p>
      </div>
    </motion.div>
  );
}
