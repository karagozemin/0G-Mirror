"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Swords } from "lucide-react";

const MotionLink = motion(Link);

const nav = [
  { href: "/", label: "Home" },
  { href: "/mirror", label: "Mirror Core" },
  { href: "/arena", label: "Olympus Arena" }
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-radial-grid text-silver">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-28 bg-gradient-to-b from-[#02040a] to-transparent" aria-hidden="true" />

      <header className="sticky top-3 z-50 px-3 sm:px-4 lg:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 rounded-[28px] border border-white/10 bg-[rgba(5,9,16,0.78)] px-4 py-3 shadow-panel-strong backdrop-blur-2xl sm:flex-row sm:items-center">
          <Link href="/" className="group flex items-center gap-3 shrink-0">
            <motion.div
              className="logo-wrap p-1.5 rounded-lg bg-white/[0.03] ring-1 ring-white/6 shadow-[0_10px_40px_rgba(34,211,238,0.06)]"
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <Image
                src="/0g-mirror-logo.png"
                alt="0G Mirror"
                width={144}
                height={44}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.01] sm:h-10"
                priority
              />
            </motion.div>
            <div className="hidden md:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan/60">Proof layer</p>
              <p className="text-sm font-semibold text-white/90">Mirror / Olympus / Verify</p>
            </div>
          </Link>

          <nav className="flex flex-wrap items-center gap-2 sm:mx-auto sm:justify-center">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    active ? "text-white" : "text-silver/58 hover:text-silver"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full border border-cyan/30 bg-cyan/10 shadow-[0_0_30px_rgba(34,211,238,0.12)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 sm:ml-auto">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-silver/55 xl:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
              </span>
              Galileo · 16602
            </div>

            <MotionLink
              href="/mirror"
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="btn-shimmer group inline-flex items-center gap-2 rounded-2xl border border-cyan/35 bg-cyan/12 px-4 py-2.5 text-sm font-semibold text-white shadow-glow-soft transition hover:border-cyan/60 hover:bg-cyan/16"
            >
              <Sparkles className="h-4 w-4 text-cyan transition group-hover:rotate-12" />
              Mirror Core
              <ArrowUpRight className="h-3.5 w-3.5 opacity-60 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </MotionLink>

            <MotionLink
              href="/arena"
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="hidden items-center gap-2 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-gold/70 hover:bg-gold/15 hover:shadow-glow-gold sm:inline-flex"
            >
              <Swords className="h-4 w-4 text-gold transition group-hover:rotate-12" />
              Arena
            </MotionLink>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
