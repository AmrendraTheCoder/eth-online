"use client";

import * as React from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia,
} from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {
  appConfig,
  validateConfig,
  getDevelopmentWarnings,
} from "@/lib/config";
import "@rainbow-me/rainbowkit/styles.css";

// Create a singleton QueryClient to prevent multiple instances
let queryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: 1,
        },
      },
    });
  }
  return queryClient;
}

// Create a singleton config to prevent multiple WalletConnect initializations
let config: ReturnType<typeof getDefaultConfig> | undefined = undefined;

function getConfig() {
  if (!config) {
    const { wallets } = getDefaultWallets();

    // Validate configuration
    const validation = validateConfig();
    if (!validation.valid) {
      console.warn("⚠️ Configuration validation failed:", validation.errors);
    }

    // Show development warnings
    const warnings = getDevelopmentWarnings();
    if (warnings.length > 0) {
      console.warn("⚠️ Development warnings:", warnings);
    }

    config = getDefaultConfig({
      appName: appConfig.walletConnect.appName,
      projectId: appConfig.walletConnect.projectId,
      wallets,
      chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
      ssr: true,
    });
  }
  return config;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const wagmiConfig = getConfig();
  const queryClientInstance = getQueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClientInstance}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
