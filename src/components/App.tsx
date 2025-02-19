"use client";

import { wagmiConfig } from "../config/wagmi";
// Context
import { RainbowKitContextProvider } from "@/hooks/context/RainbowKitContextProvider";
import { MainContextProvider } from "@/hooks/context/useMainContextProvider";
import { Web3ContextProvider } from "@/hooks/context/useWeb3ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
// Types
import { ReactElement } from "react";
import "../types/bigIntString";

function App({ children }: { children: ReactElement }) {
  const queryClient = new QueryClient();

  return (
    <MainContextProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Web3ContextProvider>
            <RainbowKitContextProvider>{children}</RainbowKitContextProvider>
          </Web3ContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MainContextProvider>
  );
}

export default App;
