"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { applyVerification } from "@/lib/ai/verifier";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { getTrace, saveTrace } from "@/lib/utils/local-store";
import { shortHash } from "@/lib/utils/hash";
import { Button } from "@/components/shared/Buttons";
import { Notice } from "@/components/shared/Notice";
import { Shell } from "@/components/shared/Shell";
import { StatusPill } from "@/components/shared/StatusPill";
import { TraceCard } from "@/components/shared/TraceCard";
import { updateTraceStatus } from "@/components/shared/client-actions";

export function VerifyClient({ traceId }: { traceId: string }) {
  const [trace, setTrace] = useState<DecisionTrace | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTrace(getTrace(traceId));
    setLoaded(true);
  }, [traceId]);

  async function replay() {
    if (!trace) return;
    setBusy(true);
    const verified = applyVerification(trace);
    const updated = await updateTraceStatus(verified);
    saveTrace(updated.trace);
    setTrace(updated.trace);
    setNotice(updated.notice ?? "Replay verification complete.");
    setBusy(false);
  }

  return (
    <Shell>
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/mirror" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan hover:text-cyan/80">
          <ArrowLeft className="h-4 w-4" />
          Back to Mirror
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan">Trace Verifier</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Replay Decision Trace</h1>
          </div>
          {trace ? <StatusPill status={trace.verification.status} /> : null}
        </div>

        {notice ? <div className="mt-5"><Notice>{notice}</Notice></div> : null}

        {loaded && !trace ? (
          <div className="glass mt-6 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-white">Trace not found</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-silver/62">
              This local demo verifier reads traces generated in this browser. Create a trace in Mirror Core or Olympus Arena, then open its verifier link.
            </p>
          </div>
        ) : null}

        {trace ? (
          <div className="mt-6 space-y-5">
            <div className="glass rounded-lg p-5">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Meta label="Trace ID" value={trace.traceId} />
                <Meta label="Storage URI" value={trace.storage?.uri ?? "pending"} />
                <Meta label="Decision hash" value={shortHash(trace.hashes.decisionHash, 8)} />
                <Meta label="Attestation" value={String(trace.attestation?.traceId ?? "pending")} />
              </div>
              <Button onClick={replay} loading={busy} variant="primary" className="mt-5">
                <RotateCcw className="h-4 w-4" />
                Replay Verification
              </Button>
            </div>

            <TraceCard trace={trace} />
          </div>
        ) : null}
      </section>
    </Shell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-white/[0.03] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-silver/45">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}
