import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "0G Mirror | Verifiable Decision Trails for AI Agents",
  description:
    "0G Mirror records, stores, replays, and attests AI-agent decisions on 0G."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
