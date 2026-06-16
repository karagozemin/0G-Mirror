"use client";

import Image from "next/image";
import { useState } from "react";
import { Crown, Database, Gavel, Scale, ShieldCheck, Swords } from "lucide-react";
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
import {
  ensureStoredAndRegisteredTrace,
  storeAndAttestVerdict,
  updateTraceStatus
} from "@/components/shared/client-actions";

type BusyState = "start" | "verify" | "appeal" | null;

export function ArenaClient() {
  const [agentA, setAgentA] = useState<AgentId>("aegis");
  const [agentB, setAgentB] = useState<AgentId>("nyx");
  const [traceA, setTraceA] = useState<DecisionTrace | null>(null);
  const [traceB, setTraceB] = useState<DecisionTrace | null>(null);
  const [verdict, setVerdict] = useState<CourtVerdict | null>(null);
  const [busy, setBusy] = useState<BusyState>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function startBattle() {
    if (agentA === agentB) return;
    setBusy("start");
    setNotice(null);
    const nextA = runAgentDecision(agentA, "defi-vault");
    const nextB = runAgentDecision(agentB, "defi-vault");
    saveTrace(nextA);
    saveTrace(nextB);
    setTraceA(nextA);
    setTraceB(nextB);
    setVerdict(null);
    setBusy(null);
  }

  async function verifyBoth() {
    if (!traceA || !traceB) return;
    setBusy("verify");
    const verifiedA = applyVerification(traceA);
    const verifiedB = applyVerification(traceB);
    const updatedA = await updateTraceStatus(verifiedA);
    const updatedB = await updateTraceStatus(verifiedB);
    setTraceA(updatedA.trace);
    setTraceB(updatedB.trace);
    setNotice(updatedA.notice ?? updatedB.notice ?? "Both decisions replayed.");
    setBusy(null);
  }

  async function appeal() {
    if (!traceA || !traceB) return;
    setBusy("appeal");
    setNotice(null);

    const verifiedA = traceA.verification.status === "Pending" ? applyVerification(traceA) : traceA;
    const verifiedB = traceB.verification.status === "Pending" ? applyVerification(traceB) : traceB;
    const registeredA = await ensureStoredAndRegisteredTrace(verifiedA);
    const registeredB = await ensureStoredAndRegisteredTrace(verifiedB);
    const claim = "Trace B ignored critical risk evidence.";
    const nextVerdict = runOlympusJudge(registeredA.trace, registeredB.trace, claim);
    const attestedVerdict = await storeAndAttestVerdict(nextVerdict, registeredA.trace, registeredB.trace);

    setTraceA(registeredA.trace);
    setTraceB(registeredB.trace);
    setVerdict(attestedVerdict.verdict);
    setNotice(attestedVerdict.notice ?? registeredA.notice ?? registeredB.notice ?? "Olympus verdict attested.");
    setBusy(null);
  }

  return (
    <Shell>
      <section className="relative overflow-hidden border-b border-line">
        <Image
          src="/olympus-mirror-hero.png"
          alt="Olympus decision arena"
          fill
          priority
          className="object-cover opacity-28"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/88 via-ink/72 to-ink" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet">Live demo mode</p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-white sm:text-5xl">Olympus Arena</h1>
              <p className="mt-3 max-w-2xl text-silver/70">
                Agents compete, Mirror records their Decision Traces, and Olympus judges the appeal using public evidence.
              </p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm font-semibold text-white">Challenge</p>
              <p className="mt-1 text-sm text-silver/65">Should this DeFi vault be trusted?</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {notice ? <div className="mb-5"><Notice>{notice}</Notice></div> : null}

        <div className="glass rounded-lg p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
            <AgentSelect label="Agent A" value={agentA} onChange={setAgentA} />
            <div className="hidden pb-3 text-violet lg:block">
              <Swords className="h-6 w-6" />
            </div>
            <AgentSelect label="Agent B" value={agentB} onChange={setAgentB} />
            <Button onClick={startBattle} loading={busy === "start"} disabled={agentA === agentB} variant="primary">
              <Swords className="h-4 w-4" />
              Start Battle
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {traceA ? <TraceCard trace={traceA} compact /> : <EmptySeat name="Agent A" />}
          {traceB ? <TraceCard trace={traceB} compact /> : <EmptySeat name="Agent B" />}
        </div>

        <div className="mt-6 glass rounded-lg p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button onClick={verifyBoth} loading={busy === "verify"} disabled={!traceA || !traceB}>
              <ShieldCheck className="h-4 w-4" />
              Verify Both
            </Button>
            <Button onClick={appeal} loading={busy === "appeal"} disabled={!traceA || !traceB} variant="primary">
              <Gavel className="h-4 w-4" />
              Appeal to Olympus
            </Button>
          </div>
          <p className="mt-3 text-sm text-silver/55">
            Olympus Arena is the live showcase: agents compete, appeal, and prove their decisions.
          </p>
        </div>

        {verdict ? <VerdictCard verdict={verdict} /> : null}
      </section>
    </Shell>
  );
}

function AgentSelect({
  label,
  value,
  onChange
}: {
  label: string;
  value: AgentId;
  onChange: (value: AgentId) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-[0.18em] text-silver/45">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as AgentId)}
        className="mt-2 h-11 w-full rounded-md border border-line bg-ink/88 px-3 text-sm font-semibold text-white outline-none transition focus:border-cyan/70"
      >
        {Object.values(agents).map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name} - {agent.role}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptySeat({ name }: { name: string }) {
  return (
    <div className="glass flex min-h-[300px] items-center justify-center rounded-lg p-6 text-center">
      <div>
        <Scale className="mx-auto h-8 w-8 text-silver/35" />
        <p className="mt-3 text-sm font-semibold text-white">{name} waiting</p>
        <p className="mt-1 text-sm text-silver/52">Start Battle to generate a Decision Trace.</p>
      </div>
    </div>
  );
}

function VerdictCard({ verdict }: { verdict: CourtVerdict }) {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-cyan/25 bg-gradient-to-br from-cyan/12 via-white/[0.045] to-violet/14 shadow-glow">
      <div className="border-b border-line bg-black/18 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-cyan">Olympus Court Verdict Card</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">{verdict.caseTitle}</h2>
          </div>
          <StatusPill status={verdict.attestation?.mode === "0g" ? "OnChain" : "Local"} />
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-md border border-line bg-black/18 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md border border-cyan/40 bg-cyan/10 text-cyan">
              <Crown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm text-silver/55">Winner</p>
              <p className="text-3xl font-semibold text-white">{verdict.verdict.winner}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-silver/74">{verdict.verdict.summary}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <VerdictMetric label="Evidence coverage A" value={`${verdict.verdict.evidenceCoverage.traceA}%`} />
          <VerdictMetric label="Evidence coverage B" value={`${verdict.verdict.evidenceCoverage.traceB}%`} />
          <VerdictMetric label="Verification A" value={verdict.verdict.verificationStatus.traceA} />
          <VerdictMetric label="Verification B" value={verdict.verdict.verificationStatus.traceB} />
          <VerdictMetric label="0G Storage URI" value={verdict.storage?.uri ?? "pending"} wide />
          <VerdictMetric label="On-chain attestation ID" value={String(verdict.attestation?.verdictId ?? "pending")} />
          <VerdictMetric label="Verdict root" value={shortHash(verdict.hashes.verdictRoot, 8)} />
        </div>
      </div>
      <div className="border-t border-line px-5 py-4 text-sm text-silver/62">
        <Database className="mr-2 inline h-4 w-4 text-cyan" />
        Claim reviewed: {verdict.claim}
      </div>
    </div>
  );
}

function VerdictMetric({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`min-w-0 rounded-md border border-line bg-black/16 p-3 ${wide ? "sm:col-span-2" : ""}`}>
      <p className="text-xs uppercase tracking-[0.16em] text-silver/45">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}
