"use client";

import { wagmiConfig } from "./config/wagmi";
// Context
import { RainbowKitContextProvider } from "@/hooks/context/RainbowKitContextProvider";
import { AppDataContextProvider } from "@/hooks/context/AppDataContextProvider";
import { Web3ContextProvider } from "@/hooks/context/Web3ContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
// Types
import { ReactElement } from "react";
import "@/types/bigIntString";

function App({ children }: { children: ReactElement }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitContextProvider>
          <Web3ContextProvider>
            <AppDataContextProvider>{children}</AppDataContextProvider>
          </Web3ContextProvider>
        </RainbowKitContextProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
