"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { FC } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../config/wagmi";
import RainbowKitProvider from "./RainbowKitProvider";
import { MainContextProvider } from "@/hooks/context/useMainContextProvider";
import { Web3ContextProvider } from "../hooks/context/useWeb3ContextProvider";
import "../types/bigIntString";

const queryClient = new QueryClient();

function App({ children }: { children?: React.ReactNode }) {
  return (
    <MainContextProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <Web3ContextProvider>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </Web3ContextProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MainContextProvider>
  );
}

export default App;
