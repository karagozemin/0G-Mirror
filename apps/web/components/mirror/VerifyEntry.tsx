"use client";

import dynamic from "next/dynamic";

const VerifyClient = dynamic(
  () => import("@/components/mirror/VerifyClient").then((module) => module.VerifyClient),
  {
    ssr: false,
    loading: () => <VerifyLoading />
  }
);

export function VerifyEntry({ traceId }: { traceId: string }) {
  return <VerifyClient traceId={traceId} />;
}

function VerifyLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-radial-grid px-4 text-silver">
      <div className="glass rounded-2xl p-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan/20 border-t-cyan" />
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.2em] text-cyan/70">Loading verifier</p>
      </div>
    </main>
  );
}
