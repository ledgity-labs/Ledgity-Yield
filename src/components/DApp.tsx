"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { FC } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "../lib/dapp/wagmi";
import RainbowKitProvider from "./RainbowKitProvider";
import { MainContextProvider } from "@/contexts";
import "../lib/bigIntString";

const queryClient = new QueryClient();

interface Props {
  children?: React.ReactNode;
}

const DApp: FC<Props> = ({ children }) => {
  return (
    <MainContextProvider defaultTab="">
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MainContextProvider>
  );
};

export default DApp;
