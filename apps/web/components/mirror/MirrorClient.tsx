"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Database, FileJson, Network, Play, ShieldCheck } from "lucide-react";
import { agents, runAgentDecision, tasks, type AgentId, type TaskId } from "@/lib/ai/agent";
import { applyVerification } from "@/lib/ai/verifier";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { saveTrace } from "@/lib/utils/local-store";
import { Button } from "@/components/shared/Buttons";
import { Notice } from "@/components/shared/Notice";
import { Shell } from "@/components/shared/Shell";
import { TraceCard } from "@/components/shared/TraceCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { ensureRegisteredTrace, ensureStoredTrace, updateTraceStatus } from "@/components/shared/client-actions";

type BusyState = "run" | "store" | "register" | "verify" | null;

export function MirrorClient() {
  const [agentId, setAgentId] = useState<AgentId>("aegis");
  const [taskId, setTaskId] = useState<TaskId>("defi-vault");
  const [trace, setTrace] = useState<DecisionTrace | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedAgent = agents[agentId];
  const selectedTask = tasks[taskId];
  const context = useMemo(() => selectedTask.context.join(" · "), [selectedTask]);

  function runDecision() {
    setBusy("run");
    setNotice(null);
    const nextTrace = runAgentDecision(agentId, taskId);
    saveTrace(nextTrace);
    setTrace(nextTrace);
    setBusy(null);
  }

  async function storeTrace() {
    if (!trace) return;
    setBusy("store");
    const result = await ensureStoredTrace(trace);
    setTrace(result.trace);
    setNotice(result.notice);
    setBusy(null);
  }

  async function registerTrace() {
    if (!trace) return;
    setBusy("register");
    const result = await ensureRegisteredTrace(trace);
    setTrace(result.trace);
    setNotice(result.notice);
    setBusy(null);
  }

  async function verifyTrace() {
    if (!trace) return;
    setBusy("verify");
    const verified = applyVerification(trace);
    const result = await updateTraceStatus(verified);
    saveTrace(result.trace);
    setTrace(result.trace);
    setNotice(result.notice ?? "Replay verification complete.");
    setBusy(null);
  }

  return (
    <Shell>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">0G Mirror Core</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Create a verifiable Decision Trace</h1>
            <p className="mt-3 max-w-2xl text-silver/68">
              Decision traces, not hidden chain-of-thought. Inputs, evidence, model config, tools, public rationale, hashes, storage, and attestations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {trace?.storage?.mode === "0g" ? <StatusPill status="OnChain" /> : null}
            {trace?.storage?.mode === "local" ? <StatusPill status="Local" /> : null}
          </div>
        </div>

        {notice ? <div className="mb-5"><Notice>{notice}</Notice></div> : null}

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="glass rounded-lg p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-silver/55">
                <ShieldCheck className="h-4 w-4 text-cyan" />
                Choose Agent
              </div>
              <div className="mt-4 grid gap-3">
                {Object.values(agents).map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setAgentId(agent.id)}
                    className={`rounded-md border p-4 text-left transition ${
                      agentId === agent.id
                        ? "border-cyan/55 bg-cyan/12"
                        : "border-line bg-white/[0.025] hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="font-semibold text-white">{agent.name}</span>
                    <span className="mt-1 block text-sm text-silver/62">{agent.role}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-lg p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-silver/55">
                <FileJson className="h-4 w-4 text-violet" />
                Choose Task
              </div>
              <div className="mt-4 grid gap-3">
                {Object.values(tasks).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setTaskId(task.id)}
                    className={`rounded-md border p-4 text-left transition ${
                      taskId === task.id
                        ? "border-violet/55 bg-violet/12"
                        : "border-line bg-white/[0.025] hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="font-semibold text-white">{task.title}</span>
                    <span className="mt-1 block text-sm text-silver/62">{task.input}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass rounded-lg p-5">
              <p className="text-sm text-silver/55">Selected context</p>
              <p className="mt-2 text-sm leading-6 text-silver/78">{context}</p>
              <Button onClick={runDecision} loading={busy === "run"} variant="primary" className="mt-5 w-full">
                <Play className="h-4 w-4" />
                Run Decision
              </Button>
            </div>
          </div>

          <div className="space-y-5">
            {trace ? (
              <>
                <TraceCard trace={trace} />
                <div className="glass rounded-lg p-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Button onClick={storeTrace} loading={busy === "store"}>
                      <Database className="h-4 w-4" />
                      Store on 0G
                    </Button>
                    <Button onClick={registerTrace} loading={busy === "register"}>
                      <Network className="h-4 w-4" />
                      Register On-chain
                    </Button>
                    <Button onClick={verifyTrace} loading={busy === "verify"} variant="primary">
                      <CheckCircle2 className="h-4 w-4" />
                      Verify Decision
                    </Button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-silver/55">
                    <span>Stored on 0G. Verified by replay. Attested on-chain.</span>
                    <Link href={`/verify/${trace.traceId}`} className="font-semibold text-cyan hover:text-cyan/80">
                      Open verifier
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="glass flex min-h-[580px] items-center justify-center rounded-lg p-8 text-center">
                <div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                    <FileJson className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-2xl font-semibold text-white">Decision Trace waiting</h2>
                  <p className="mt-3 max-w-md text-sm leading-6 text-silver/62">
                    Run an agent decision to generate the auditable payload Mirror stores and attests.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </Shell>
  );
}
