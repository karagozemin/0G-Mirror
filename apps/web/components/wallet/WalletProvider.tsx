"use client";

import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [providers, setProviders] = useState<{
    WagmiProvider?: any;
    RainbowKitProvider?: any;
    wagmiConfig?: any;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const [rainbow, wagmiModule] = await Promise.all([
          import("@rainbow-me/rainbowkit"),
          import("wagmi")
        ]);

        const { RainbowKitProvider } = rainbow as any;
        const { WagmiProvider } = wagmiModule as any;
        const { wagmiConfig } = await import("@/lib/wallet/wagmi");

        if (mounted) setProviders({ WagmiProvider, RainbowKitProvider, wagmiConfig });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Wallet providers load error:", err);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (!providers) return null;

  const { WagmiProvider, RainbowKitProvider, wagmiConfig } = providers;

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider locale="en">{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
