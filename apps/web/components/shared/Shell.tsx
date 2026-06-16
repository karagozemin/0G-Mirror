import Link from "next/link";
import { ArrowUpRight, CircuitBoard, Swords } from "lucide-react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/mirror", label: "Mirror Core" },
  { href: "/arena", label: "Olympus Arena" }
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-radial-grid text-silver">
      <header className="sticky top-0 z-40 border-b border-line bg-ink/76 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-cyan/30 bg-cyan/10 text-cyan">
              <CircuitBoard className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-wide text-white">0G Mirror</span>
              <span className="block text-xs text-silver/55">Decision Trace Registry</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-md border border-line bg-white/[0.03] p-1 md:flex">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded px-3 py-2 text-sm text-silver/70 transition hover:bg-white/[0.06] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/arena"
            className="inline-flex items-center gap-2 rounded-md border border-violet/30 bg-violet/10 px-3 py-2 text-sm font-medium text-white transition hover:border-violet/60 hover:bg-violet/15"
          >
            <Swords className="h-4 w-4" />
            Arena
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>
      {children}
    </main>
  );
}
