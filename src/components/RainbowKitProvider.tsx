"use client";

import "@rainbow-me/rainbowkit/styles.css";
import {
  type DisclaimerComponent, 
  type Theme,
  lightTheme,
  RainbowKitProvider as _RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import merge from "lodash.merge";
import { FC } from "react";
import { Blockie } from "@/components/icons/Blockie";

// Built RainbowKit theme
const ledgityTheme: Theme = merge(lightTheme(), {
  colors: {
    accentColor: "rgb(var(--primary-bg))",
    accentColorForeground: "rgb(var(--primary-fg))",
    profileForeground: "#eef2ff",
    modalBackdrop: "var(--modal-backdrop)",
  },
  blurs: {
    modalOverlay: "blur(12px)",
  },
  fonts: {
    body: "var(--font-body)",
  },
} as Theme);

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    By connecting your wallet, you agree to <br />
    our&nbsp;
    <Link href="/legal/terms-and-conditions">Terms & Conditions</Link> and&nbsp;
    <Link href="/legal/privacy-policy">Privacy Policy</Link>.
  </Text>
);

interface Props {
  children?: React.ReactNode;
}

const RainbowKitProvider: FC<Props> = ({ children }) => {
  return (
    <_RainbowKitProvider
      appInfo={{
        disclaimer: Disclaimer,
      }}
      avatar={Blockie}
      theme={ledgityTheme}
      showRecentTransactions={true}
    >
      {children}
    </_RainbowKitProvider>
  );
};

export default RainbowKitProvider;
