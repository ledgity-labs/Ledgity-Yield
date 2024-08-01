"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { FC } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../lib/dapp/config";
import RainbowKitProvider from "./RainbowKitProvider";
import { MainContextProvider } from "@/contexts";

const queryClient = new QueryClient();

interface Props {
  children?: React.ReactNode;
}

const DApp: FC<Props> = ({ children }) => {
  return (
    <MainContextProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>{children}</RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MainContextProvider>
  );
};

export default DApp;
