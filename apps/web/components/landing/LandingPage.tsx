import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Database, FileCheck2, Gavel, Network, PlayCircle, ShieldQuestion } from "lucide-react";
import { Shell } from "@/components/shared/Shell";

const problem = [
  "Users cannot prove which evidence an agent used.",
  "Teams cannot replay the same decision path.",
  "Future agents cannot learn from verified prior decisions."
];

const zeroG = [
  { icon: <Database className="h-5 w-5" />, title: "0G Storage", copy: "Decision Trace JSON and Court Verdict JSON are uploaded as verifiable payloads." },
  { icon: <Network className="h-5 w-5" />, title: "0G Chain", copy: "Hashes, roots, URIs, and verification status are registered in MirrorRegistry." },
  { icon: <FileCheck2 className="h-5 w-5" />, title: "Replay verifier", copy: "Public evidence is scored again to classify Verified, Inconsistent, or Missing Evidence." }
];

export function LandingPage() {
  return (
    <Shell>
      <section className="relative min-h-[82vh] overflow-hidden">
        <Image
          src="/olympus-mirror-hero.png"
          alt="Cyber-Olympus mirrored decision ledger"
          fill
          priority
          className="object-cover opacity-56"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/76 to-ink/30" />
        <div className="absolute inset-0 subtle-grid opacity-50" />

        <div className="relative mx-auto flex min-h-[82vh] max-w-7xl items-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan">Olympus Arena demo mode</p>
            <h1 className="mt-5 text-5xl font-semibold tracking-normal text-white sm:text-7xl">0G Mirror</h1>
            <p className="mt-4 text-2xl text-silver/88 sm:text-3xl">Verifiable Decision Trails for AI Agents</p>
            <p className="mt-6 max-w-2xl text-base leading-7 text-silver/72 sm:text-lg">
              AI agents are making decisions with money, trust, and consequences. 0G Mirror turns every agent decision into an auditable trail stored on 0G, replayed through verification, and attested on-chain.
            </p>
            <p className="mt-5 text-sm font-semibold text-white">
              We didn’t build another AI agent app. We built the mirror that proves what agents decided.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/mirror" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-cyan/55 bg-cyan/15 px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-cyan/20">
                Launch Mirror <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/arena" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-violet/45 bg-violet/12 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet/18">
                Enter Olympus Arena <Gavel className="h-4 w-4" />
              </Link>
              <a href="#walkthrough" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-line bg-white/[0.04] px-5 py-3 text-sm font-semibold text-silver transition hover:bg-white/[0.07]">
                View Demo Flow <PlayCircle className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-black/18 px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <Statement title="Decision traces, not hidden chain-of-thought." copy="Mirror records inputs, evidence, model config, tools, public rationale, output, hashes, and attestations." />
          <Statement title="Stored on 0G. Verified by replay. Attested on-chain." copy="0G is the data and attestation layer, not a decorative integration." />
          <Statement title="Olympus Arena is the live showcase: agents compete, appeal, and prove their decisions." copy="The arena makes the infrastructure legible in one judge-friendly flow." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-violet">The Problem</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">AI agents are black boxes at the moment of action.</h2>
            <p className="mt-4 text-silver/68">
              Agent decisions increasingly move funds, shape trust, and trigger operational consequences. The missing primitive is a verifiable public trail.
            </p>
          </div>
          <div className="grid gap-3">
            {problem.map((item) => (
              <div key={item} className="glass rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <ShieldQuestion className="h-5 w-5 text-danger" />
                  <p className="font-medium text-white">{item}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white/[0.025] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan">How 0G Is Used</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">0G Mirror Core records, stores, replays, and attests.</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {zeroG.map((item) => (
              <div key={item.title} className="glass rounded-lg p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
                  {item.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-silver/65">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="walkthrough" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-violet">Olympus Arena Showcase</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Aegis vs Nyx, judged by evidence.</h2>
            <p className="mt-4 text-silver/68">
              Two deterministic AI agents analyze the same DeFi vault. Mirror records both Decision Traces. Olympus reviews disputes with the same public evidence trail.
            </p>
          </div>
          <div className="glass rounded-lg p-5">
            <ol className="space-y-3 text-sm text-silver/76">
              {["Create agent decision", "Store trace on 0G", "Register attestation on-chain", "Replay verification", "Appeal to Olympus", "Store and attest court verdict"].map((step, index) => (
                <li key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan/35 bg-cyan/10 text-xs font-bold text-cyan">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </Shell>
  );
}

function Statement({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-silver/65">{copy}</p>
    </div>
  );
}
