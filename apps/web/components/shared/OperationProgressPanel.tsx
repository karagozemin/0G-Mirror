"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export type OperationProgressState = {
  phase: string;
  label: string;
  detail: string;
  step: number;
  percent: number;
};

const accents = {
  gold: {
    panel: "border-gold/20 bg-black/25",
    badge: "border-gold/30 bg-gold/10 text-gold",
    label: "text-gold/70",
    percent: "text-gold",
    bar: "bg-gradient-to-r from-gold via-beam to-gold",
    shadow: "shadow-[0_0_20px_rgba(251,191,36,0.32)]"
  },
  beam: {
    panel: "border-beam/20 bg-black/25",
    badge: "border-beam/30 bg-beam/10 text-beam",
    label: "text-beam/70",
    percent: "text-beam",
    bar: "bg-gradient-to-r from-beam via-gold to-beam",
    shadow: "shadow-[0_0_20px_rgba(168,85,247,0.32)]"
  }
} as const;

export function OperationProgressPanel({
  progress,
  totalSteps,
  accent = "gold"
}: {
  progress: OperationProgressState;
  totalSteps: number;
  accent?: keyof typeof accents;
}) {
  const theme = accents[accent];
  const isComplete = progress.phase === "complete";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: 10, height: 0 }}
      className={`mt-4 overflow-hidden rounded-xl border p-4 ${theme.panel}`}
      aria-live="polite"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.badge}`}>
            {isComplete ? <CheckCircle2 className="h-5 w-5" /> : <Loader2 className="h-5 w-5 animate-spin" />}
          </div>
          <div className="min-w-0">
            <p className={`font-mono text-[10px] uppercase tracking-[0.18em] ${theme.label}`}>{progress.label}</p>
            <p className="mt-1 truncate text-sm font-medium text-white" title={progress.detail}>
              {progress.detail}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-silver/60">
            Step {progress.step}/{totalSteps}
          </span>
          <span className={`min-w-12 text-right font-mono text-sm font-bold ${theme.percent}`}>{progress.percent}%</span>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          initial={false}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={`h-full rounded-full ${theme.bar} ${theme.shadow}`}
        />
      </div>
    </motion.div>
  );
}