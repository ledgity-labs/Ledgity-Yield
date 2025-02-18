"use client";

import { useAccountModal, useConnectModal } from "@rainbow-me/rainbowkit";
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  WalletName,
} from "@/components/ui";
import { useState, useEffect } from "react";
import { NetworkIcon } from "../icons/NetworkIcon";
import { Blockie } from "../icons/Blockie";
// Context
import { useWeb3Context } from "../../hooks/context/useWeb3ContextProvider";
// Data
import {
  getNetworkConfig,
  getNetworkConfigs,
} from "../../functions/marketsAndNetworksConfig";

export function ConnectButton() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { openAccountModal } = useAccountModal();
  const { openConnectModal } = useConnectModal();
  const {
    currentAccount,
    walletChainId,
    isConnected,
    appChainId,
    handleSwitchNetwork,
    currentNetworkConfig,
    isChangingNetwork,
  } = useWeb3Context();

  function handleChangeNetwork(newChainid: string) {
    handleSwitchNetwork(Number(newChainid));
  }

  const networkConfigs = getNetworkConfigs();
  const isCompatibleNetwork = isConnected
    ? getNetworkConfig(walletChainId)?.isCompatibleNetwork
    : currentNetworkConfig.isCompatibleNetwork;
  const wrongNetwork = !isCompatibleNetwork;

  // Return a simple placeholder during server-side rendering
  if (!isMounted) {
    return (
      <div className="flex sm:gap-6 gap-3 justify-center items-center">
        <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-10 w-36 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex sm:gap-6 gap-3 justify-center items-center">
      <Select onValueChange={handleChangeNetwork} value={appChainId.toString()}>
        <SelectTrigger isLoading={isChangingNetwork}>
          <SelectValue placeholder="Select a network..." />
        </SelectTrigger>
        <SelectContent>
          {networkConfigs.map((config, i) => (
            <SelectItem value={config.chainId.toString()} key={i}>
              <div className="flex justify-center items-center gap-[0.6rem]">
                <NetworkIcon chainName={config.name} chainId={config.chainId} />
                <span className="font-semibold sm:inline hidden">
                  {config.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isConnected ? (
        <Button
          disabled={wrongNetwork || isChangingNetwork}
          onClick={openAccountModal}
          size="medium"
          variant={wrongNetwork ? "destructive" : "primary"}
          className="flex justify-between gap-3 overflow-hidden pr-[5px]"
        >
          <span className="min-[420px]:inline-block hidden">
            <WalletName address={currentAccount as `0x${string}`} />
          </span>
          <Blockie address={currentAccount} className="mr-2" />
          <i className="ri-wallet-3-fill min-[420px]:hidden inline text-2xl pr-2" />
        </Button>
      ) : (
        <Button
          disabled={wrongNetwork || isChangingNetwork}
          size="large"
          onClick={openConnectModal}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  );
}
