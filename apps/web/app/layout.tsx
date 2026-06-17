import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { OpenLinksInNewTab } from "@/components/shared/OpenLinksInNewTab";
import WalletProvider from "@/components/wallet/WalletProvider";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap"
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap"
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap"
});

export const metadata: Metadata = {
  title: "0G Mirror | Proof Layer for Agent Decisions",
  description: "Record, replay, and attest agent decisions on 0G with a cinematic proof-first interface.",
  icons: {
    icon: "/0g-mirror-logo.png",
    apple: "/0g-mirror-logo.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="antialiased">
        <div className="noise" aria-hidden="true" />
        <OpenLinksInNewTab />
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
