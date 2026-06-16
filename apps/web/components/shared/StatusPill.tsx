import type { VerificationStatus } from "@/lib/schemas/decision-trace";

const styles: Record<VerificationStatus | "Local" | "OnChain", string> = {
  Pending: "border-silver/20 bg-white/[0.04] text-silver/75",
  Verified: "border-mint/40 bg-mint/10 text-mint",
  Inconsistent: "border-danger/45 bg-danger/10 text-danger",
  MissingEvidence: "border-warn/45 bg-warn/10 text-warn",
  Local: "border-warn/45 bg-warn/10 text-warn",
  OnChain: "border-cyan/45 bg-cyan/10 text-cyan"
};

export function StatusPill({ status }: { status: VerificationStatus | "Local" | "OnChain" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
