"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Database,
  FileCheck2,
  Gavel,
  Network,
  Shield,
  ShieldQuestion,
  Swords,
  Zap
} from "lucide-react";
import { MirrorBackground } from "@/components/fx/MirrorBackground";
import { LiveTicker } from "@/components/fx/LiveTicker";
import { HeroReveal, Reveal, StaggerChildren, StaggerItem } from "@/components/fx/Reveal";
import { Shell } from "@/components/shared/Shell";

const MotionLink = motion(Link);

const stats = [
  { value: "Verified", label: "Trace #1 on Galileo", accent: "text-mint" },
  { value: "0G", label: "Storage + Chain attested", accent: "text-cyan" },
  { value: "Replay", label: "Consistent decision path", accent: "text-gold" }
];

const problem = [
  "No proof of which evidence an agent actually used.",
  "No way to replay the same decision path independently.",
  "No on-chain attestation future systems can trust."
];

const zeroG = [
  {
    icon: Database,
    title: "0G Storage",
    copy: "Decision Trace JSON and Court Verdict JSON uploaded as verifiable payloads.",
    color: "text-cyan border-cyan/30 bg-cyan/10"
  },
  {
    icon: Network,
    title: "0G Chain",
    copy: "Hashes, roots, URIs, and verification status registered in MirrorRegistry.",
    color: "text-gold border-gold/30 bg-gold/10"
  },
  {
    icon: FileCheck2,
    title: "Replay Verifier",
    copy: "Public evidence re-scored to classify Verified, Inconsistent, or Missing Evidence.",
    color: "text-mint border-mint/30 bg-mint/10"
  }
];

const steps = [
  "Agent makes a decision",
  "Mirror records the trace",
  "Store payload on 0G",
  "Register attestation on-chain",
  "Replay verification",
  "Appeal to Olympus"
];

export function LandingPage() {
  return (
    <Shell>
      {/* ── HERO ── */}
      <section className="relative min-h-screen overflow-hidden">
        <MirrorBackground />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink/20 to-ink" />

        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <HeroReveal delay={0}>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan/8 px-4 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-60" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">Live on Galileo Testnet</span>
                </div>
              </HeroReveal>

              <HeroReveal delay={0.1}>
                <h1 className="sr-only">0G Mirror</h1>
                <p className="mt-8 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Every agent decision,
                  <br />
                  <span className="gradient-text">mirrored on-chain.</span>
                </p>
              </HeroReveal>

              <HeroReveal delay={0.2}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-silver/70">
                  0G Mirror turns consequential agent decisions into auditable trails — stored on 0G, verified by replay, attested on-chain. Not another chatbot. The proof layer.
                </p>
              </HeroReveal>

              <HeroReveal delay={0.3}>
                <div className="mt-10 flex flex-wrap gap-4">
                  <MotionLink
                    href="/mirror"
                    whileHover={{ y: -3, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className="btn-shimmer group inline-flex min-h-13 items-center gap-3 rounded-2xl border border-cyan/50 bg-cyan/12 px-7 py-4 text-base font-bold text-white shadow-glow transition hover:border-cyan/80 hover:shadow-glow-lg"
                  >
                    <Zap className="h-5 w-5 transition group-hover:scale-110" />
                    Launch Mirror Core
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </MotionLink>
                  <MotionLink
                    href="/arena"
                    whileHover={{ y: -3, scale: 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className="group inline-flex min-h-13 items-center gap-3 rounded-2xl border border-gold/40 bg-gold/8 px-7 py-4 text-base font-bold text-white transition hover:border-gold/65 hover:shadow-glow-gold"
                  >
                    <Swords className="h-5 w-5 text-gold transition group-hover:rotate-12" />
                    Enter Olympus Arena
                  </MotionLink>
                </div>
              </HeroReveal>

              <HeroReveal delay={0.45}>
                <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-line bg-white/[0.03] px-4 py-3 backdrop-blur-sm">
                      <p className={`font-display text-2xl font-bold ${s.accent}`}>{s.value}</p>
                      <p className="mt-0.5 text-xs text-silver/50">{s.label}</p>
                    </div>
                  ))}
                </div>
              </HeroReveal>
            </div>

            <HeroReveal delay={0.2} className="hidden lg:block">
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute -inset-8 rounded-full bg-cyan/10 blur-3xl" />
                <div className="logo-hero relative flex items-center justify-center">
                  <div className="logo-hero-frame">
                    <Image
                      src="/0g-mirror-logo.png"
                      alt="0G Mirror"
                      width={420}
                      height={420}
                      className="relative h-auto w-[340px]"
                      priority
                    />
                  </div>
                </div>
              </motion.div>
            </HeroReveal>
          </div>
        </div>
      </section>

      <LiveTicker />

      {/* ── MODE SELECT ── */}
      <section className="relative border-b border-line px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-cyan/70">Choose your path</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">Two modes. One proof layer.</h2>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <ModeCard
              href="/mirror"
              icon={Shield}
              title="Mirror Core"
              subtitle="Decision Trace Registry"
              description="Select an agent, run a decision, store on 0G, register on-chain, and verify by replay."
              accent="cyan"
              delay={0}
            />
            <ModeCard
              href="/arena"
              icon={Gavel}
              title="Olympus Arena"
              subtitle="Agent vs Agent · Court Verdict"
              description="Two agents battle on the same challenge. Mirror records both traces. Olympus judges the appeal."
              accent="gold"
              delay={0.1}
            />
          </div>
        </div>
      </section>

      {/* ── STATEMENTS ── */}
      <section className="border-b border-line bg-void/50 px-4 py-16 sm:px-6 lg:px-8">
        <StaggerChildren className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          {[
            { title: "Decision traces, not hidden reasoning.", copy: "Inputs, evidence, model config, tools, public rationale, output, hashes, and attestations." },
            { title: "Stored on 0G. Verified by replay.", copy: "0G is the data and attestation layer — not a decorative integration." },
            { title: "Olympus Arena makes it legible.", copy: "Agents compete, appeal, and prove their decisions in one judge-friendly flow." }
          ].map((s) => (
            <StaggerItem key={s.title}>
              <div className="glass glass-hover rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-silver/60">{s.copy}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerChildren>
      </section>

      {/* ── PROBLEM ── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-danger/80">The Problem</p>
            <h2 className="mt-4 font-display text-4xl font-bold text-white">
              Agents act.<br />Nobody can prove why.
            </h2>
            <p className="mt-4 text-silver/60">
              Decisions move funds, shape trust, trigger consequences. The missing primitive is a verifiable public trail anyone can inspect and replay.
            </p>
          </Reveal>
          <StaggerChildren className="grid gap-3">
            {problem.map((item, i) => (
              <StaggerItem key={item}>
                <div className="glass glass-hover flex items-center gap-4 rounded-xl p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-danger/30 bg-danger/10">
                    <ShieldQuestion className="h-5 w-5 text-danger" />
                  </div>
                  <p className="font-medium text-white">{item}</p>
                  <span className="ml-auto font-mono text-xs text-silver/30">0{i + 1}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── 0G STACK ── */}
      <section className="border-y border-line bg-white/[0.015] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-cyan/70">Infrastructure</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">Built on 0G. Proven on-chain.</h2>
          </Reveal>
          <StaggerChildren className="mt-10 grid gap-5 md:grid-cols-3" stagger={0.12}>
            {zeroG.map((item) => (
              <StaggerItem key={item.title}>
                <div className="glass glass-hover group rounded-2xl p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition group-hover:scale-105 ${item.color}`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 font-display text-xl font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-silver/60">{item.copy}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section id="walkthrough" className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <MirrorBackground variant="subtle" />
        <div className="relative">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-gold/80">Demo Flow</p>
            <h2 className="mt-3 font-display text-4xl font-bold text-white">From decision to court verdict.</h2>
          </Reveal>

          <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
            <StaggerChildren className="space-y-0">
              {steps.map((step, i) => (
                <StaggerItem key={step}>
                  <div className="pipeline-step flex items-start gap-4">
                    <div className="flex flex-col items-center">
                      <div className="step-dot flex h-9 w-9 items-center justify-center rounded-full border border-cyan/40 bg-cyan/10 font-mono text-xs font-bold text-cyan">
                        {i + 1}
                      </div>
                      {i < steps.length - 1 ? (
                        <div className="my-1 h-8 w-px bg-gradient-to-b from-cyan/40 to-transparent" />
                      ) : null}
                    </div>
                    <div className="pb-6 pt-1.5">
                      <p className="font-medium text-white">{step}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerChildren>

            <Reveal index={2} variant="scaleIn">
              <div className="border-animated overflow-hidden rounded-2xl">
                <div className="glass p-8 text-center">
                  <Swords className="mx-auto h-10 w-10 text-gold" />
                  <h3 className="mt-4 font-display text-2xl font-bold text-white">Aegis vs Nyx</h3>
                  <p className="mt-2 text-sm text-silver/60">
                    Two agents. Same DeFi vault challenge. Mirror records both Decision Traces. Olympus reviews the dispute with public evidence.
                  </p>
                  <MotionLink
                    href="/arena"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 520, damping: 28 }}
                    className="btn-shimmer mt-6 inline-flex items-center gap-2 rounded-xl border border-gold/45 bg-gold/10 px-6 py-3 text-sm font-bold text-white transition hover:border-gold/70"
                  >
                    Start the battle <ArrowRight className="h-4 w-4" />
                  </MotionLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section className="border-t border-line px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <p className="font-display text-3xl font-bold text-white sm:text-4xl">
              The mirror that proves what agents decided.
            </p>
            <p className="mt-4 text-silver/55">Stored on 0G · Verified by replay · Attested on-chain</p>
            <MotionLink
              href="/mirror"
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="btn-shimmer mt-8 inline-flex items-center gap-2 rounded-2xl border border-cyan/50 bg-cyan/12 px-8 py-4 text-base font-bold text-white shadow-glow transition hover:shadow-glow-lg"
            >
              <Zap className="h-5 w-5" />
              Launch Mirror Core
            </MotionLink>
          </Reveal>
        </div>
      </section>
    </Shell>
  );
}

function ModeCard({
  href,
  icon: Icon,
  title,
  subtitle,
  description,
  accent,
  delay
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  description: string;
  accent: "cyan" | "gold";
  delay: number;
}) {
  const colors = {
    cyan: "border-cyan/30 hover:border-cyan/55 hover:shadow-glow group-hover:text-cyan",
    gold: "border-gold/30 hover:border-gold/55 hover:shadow-glow-gold group-hover:text-gold"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <MotionLink
        href={href}
        whileHover={{ y: -4, scale: 1.01 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: "spring", stiffness: 520, damping: 28 }}
        className={`group glass glass-hover flex flex-col rounded-2xl p-7 transition ${colors[accent]}`}
      >
        <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-white/[0.04] transition group-hover:scale-105 ${colors[accent]}`}>
          <Icon className="h-7 w-7" />
        </div>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-silver/45">{subtitle}</p>
        <h3 className="mt-1 font-display text-2xl font-bold text-white">{title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-silver/60">{description}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white transition group-hover:gap-3">
          Enter <ArrowRight className="h-4 w-4" />
        </span>
      </MotionLink>
    </motion.div>
  );
}
