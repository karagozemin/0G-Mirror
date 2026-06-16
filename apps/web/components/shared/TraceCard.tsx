import { CheckCircle2, Database, Fingerprint, Network, ShieldAlert } from "lucide-react";
import type { DecisionTrace } from "@/lib/schemas/decision-trace";
import { shortHash } from "@/lib/utils/hash";
import { StatusPill } from "@/components/shared/StatusPill";

export function TraceCard({ trace, compact = false }: { trace: DecisionTrace; compact?: boolean }) {
  return (
    <article className="glass rounded-lg p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan/75">{trace.agent.role}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">{trace.agent.name}</h3>
        </div>
        <StatusPill status={trace.verification.status} />
      </div>

      <div className="mt-5 rounded-md border border-line bg-black/18 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <CheckCircle2 className="h-4 w-4 text-cyan" />
          {trace.decision.label}
        </div>
        <p className="mt-2 text-sm text-silver/78">{trace.decision.output}</p>
        <p className="mt-3 text-sm text-silver/62">{trace.decision.publicRationale}</p>
      </div>

      <div className={`mt-5 grid gap-3 ${compact ? "grid-cols-1" : "sm:grid-cols-2"}`}>
        <InfoLine icon={<Fingerprint className="h-4 w-4" />} label="Decision hash" value={shortHash(trace.hashes.decisionHash, 8)} />
        <InfoLine icon={<Database className="h-4 w-4" />} label="0G Storage URI" value={trace.storage?.uri ?? "pending"} />
        <InfoLine icon={<Network className="h-4 w-4" />} label="On-chain trace ID" value={String(trace.attestation?.traceId ?? "pending")} />
        <InfoLine icon={<ShieldAlert className="h-4 w-4" />} label="Replay result" value={trace.verification.replayResult ?? "not replayed"} />
      </div>

      {!compact ? (
        <div className="mt-5">
          <p className="mb-2 text-xs uppercase tracking-[0.18em] text-silver/45">Evidence Used</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {trace.evidence.map((item) => (
              <div key={`${item.name}-${item.value}`} className="rounded-md border border-line bg-white/[0.03] px-3 py-2">
                <p className="text-xs text-silver/50">{item.type}</p>
                <p className="text-sm font-medium text-white">
                  {item.name}: <span className="text-silver/72">{item.value}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-line bg-white/[0.025] px-3 py-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-silver/45">
        <span className="text-cyan/75">{icon}</span>
        {label}
      </div>
      <p className="mt-1 truncate text-sm text-silver/82" title={value}>
        {value}
      </p>
    </div>
  );
}
