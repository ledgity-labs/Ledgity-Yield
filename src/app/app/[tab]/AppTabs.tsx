"use client";
import { AppDashboard } from "@/components/app/dashboard/AppDashboard";
import { AppGetUSDC } from "@/components/app/get-usdc/AppGetUSDC";
import { AppInvest } from "@/components/app/invest/AppInvest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { useMainContext } from "@/hooks/context/useMainContextProvider";

import { twMerge } from "tailwind-merge";
import { AppPreMining } from "@/components/app/pre-mining/AppPreMining";
import { SessionProvider } from "next-auth/react";
import { AppStaking } from "@/components/app/staking/AppStaking";
import Link from "next/link";
import { AppAffiliate } from "@/components/app/affiliate/AppAffiliate";

import { SwapWidget } from "../../../components/app/widget/SwapWidget";
import { BridgeWidget } from "../../../components/app/widget/BridgeWidget";

export function AppTabs() {
  const { currentTab, switchTab } = useMainContext();

  return (
    <Tabs
      value={currentTab}
      className="flex w-screen max-w-[100vw] flex-col items-center justify-center sm:gap-10 gap-5"
      onValueChange={(v) => switchTab(v)}
    >
      <Link
        href="https://www.coingecko.com/en/coins/ledgity-token"
        target="_blank"
      >
        <div className="overflow flex scale-90 flex-col flex-wrap overflow-hidden rounded-3xl text-white opacity-100 drop-shadow-md backdrop-blur-md hover:opacity-80 sm:flex-row sm:flex-nowrap">
          <div className="flex items-center justify-center gap-1 whitespace-nowrap bg-gradient-to-bl from-[#20456c]/50 to-[purple] px-4 py-2 text-lg font-bold text-white">
            <i className="ri-fire-fill text-x animate-pulse" />
            <p>LDY Token</p>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-bl from-[#20456c]/50 to-[red] gap-2 px-4 py-2 text-center text-lg font-semibold text-white md:px-3 md:py-1.5 ">
            Buy on MEXC or Uniswap
            <i className="ri-arrow-right-line text-xl font-bold text-orange-[#20456c]" />
          </div>
        </div>
      </Link>
      <TabsList className="mb-6 mt-12 sm:w-fit w-[250px]">
        <TabsTrigger
          value="invest"
          className="[&_div:hover]:!opacity-100 [&_div:hover]:!grayscale-0"
        >
          Invest
        </TabsTrigger>
        <TabsTrigger value="staking">
          Staking
          <div
            className={twMerge(
              "absolute right-[20%] -top-[2rem] z-20 flex items-center justify-center gap-1 rounded-xl bg-gradient-to-bl from-[#20456c]/50 to-[red] px-[0.47rem] py-[0.04rem] text-center text-[0.8rem] font-bold text-white",
              currentTab === "staking" && "opacity-50 hover:opacity-100",
            )}
          >
            <i className="ri-fire-fill text-x animate-pulse" />
            Hot
            <i className="ri-arrow-down-s-fill absolute -bottom-[1.33rem] left-1.5 -z-10 text-3xl text-[#20456c]/90"></i>
          </div>
        </TabsTrigger>
        <TabsTrigger
          value="pre-mining"
          className="[&_div:hover]:!opacity-100 [&_div:hover]:!grayscale-0 hidden"
        >
          Pre-Mining
        </TabsTrigger>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="affiliate">Affiliate Program</TabsTrigger>
        <TabsTrigger value="swap">Swap</TabsTrigger>
        <TabsTrigger value="bridge">Bridge</TabsTrigger>
      </TabsList>
      <div className="[&_>_*]:animate-fadeAndMoveIn [&_>_*]:[animation-duration:300ms] sm:px-5 max-w-[100vw]">
        <SessionProvider>
          <TabsContent value="invest">
            <AppInvest />
          </TabsContent>
          <TabsContent value="pre-mining">
            <AppPreMining />
          </TabsContent>
          <TabsContent value="get-usdc">
            <AppGetUSDC />
          </TabsContent>
          <TabsContent value="staking">
            <AppStaking />
          </TabsContent>
          <TabsContent value="dashboard">
            <AppDashboard />
          </TabsContent>
          <TabsContent value="affiliate">
            <AppAffiliate />
          </TabsContent>
          <TabsContent value="swap">
            <SwapWidget />
          </TabsContent>
          <TabsContent value="bridge">
            <BridgeWidget />
          </TabsContent>
        </SessionProvider>
      </div>
    </Tabs>
  );
}
