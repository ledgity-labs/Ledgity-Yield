import {
  injectedWallet,
  rainbowWallet,
  walletConnectWallet,
  argentWallet,
  bitskiWallet,
  braveWallet,
  coinbaseWallet,
  dawnWallet,
  ledgerWallet,
  imTokenWallet,
  metaMaskWallet,
  okxWallet,
  omniWallet,
  phantomWallet,
  rabbyWallet,
  safeWallet,
  tahoWallet,
  trustWallet,
  xdefiWallet,
  zerionWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { getWagmiNetworkConfigs } from "../functions/marketsAndNetworksConfig";
import { env } from "../../env.mjs";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const wallets = [
  {
    groupName: "Popular",
    wallets: [
      metaMaskWallet,
      rabbyWallet,
      walletConnectWallet,
      ledgerWallet,
      rainbowWallet,
      safeWallet,
      trustWallet,
      okxWallet,
      phantomWallet,
      coinbaseWallet,
      braveWallet,
      argentWallet,
      injectedWallet,
    ],
  },
  {
    groupName: "Others",
    wallets: [
      bitskiWallet,
      dawnWallet,
      imTokenWallet,
      omniWallet,
      tahoWallet,
      xdefiWallet,
      zerionWallet,
    ],
  },
];

export const wagmiConfig = getDefaultConfig({
  appName: "Ledgity Yield",
  projectId: env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  batch: { multicall: true },
  chains: getWagmiNetworkConfigs(),
  wallets,
});
