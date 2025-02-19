"use client";

import { useEffect, useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import { SessionProvider } from "next-auth/react";
import Link from "next/link";

// Dynamic imports
import { AppInvest } from "@/components/app/invest/AppInvest";
import { AppStaking } from "@/components/app/staking/AppStaking";
import { AppDashboard } from "@/components/app/dashboard/AppDashboard";
import { SwapWidget } from "@/components/app/widget/SwapWidget";
import { BridgeWidget } from "@/components/app/widget/BridgeWidget";
import { AppGetUSDC } from "@/components/app/get-usdc/AppGetUSDC";
import { AppPreMining } from "@/components/app/pre-mining/AppPreMining";
import { AppAffiliate } from "@/components/app/affiliate/AppAffiliate";

export type TabParam = {
  tab: string;
  title: string;
  description?: string;
  keywords?: string[];
  isHidden?: boolean;
};

export function AppTabs({ tabParams }: { tabParams: TabParam[] }) {
  const [mounted, setMounted] = useState(false);
  const [currentTab, setCurrentTab] = useState("invest");

  useEffect(() => {
    setMounted(true);
    const pathParts = window.location.pathname.split("/");
    const tabFromUrl = pathParts[pathParts.length - 1];
    if (tabParams.some((t) => t.tab === tabFromUrl && !t.isHidden)) {
      setCurrentTab(tabFromUrl);
    }
  }, [tabParams]);

  function handleSetCurrentTab(name: string) {
    history.pushState({}, name, `/app/${name}`);
    setCurrentTab(name);
  }

  const activeTabs = useMemo(
    () => tabParams.filter((tab) => !tab.isHidden),
    [tabParams],
  );

  if (!mounted) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="animate-pulse bg-gray-200 h-96 w-full max-w-4xl rounded-lg" />
      </div>
    );
  }

  // Render tab content based on current tab
  const renderTabContent = () => {
    switch (currentTab) {
      case "invest":
        return <AppInvest />;
      case "staking":
        return <AppStaking />;
      case "dashboard":
        return <AppDashboard />;
      case "swap":
        return <SwapWidget />;
      case "bridge":
        return <BridgeWidget />;
      case "get-usdc":
        return <AppGetUSDC />;
      case "pre-mining":
        return <AppPreMining />;
      case "affiliate":
        return <AppAffiliate />;
      default:
        return <AppInvest />;
    }
  };

  return (
    <Tabs
      value={currentTab}
      className="flex w-screen max-w-[100vw] flex-col items-center justify-center sm:gap-10 gap-5"
      onValueChange={handleSetCurrentTab}
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
        {activeTabs.map((tab) => (
          <TabsTrigger key={tab.tab} value={tab.tab}>
            {tab.title}
            {tab.tab === "staking" && (
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
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      <div className="sm:px-5 max-w-[100vw]">
        <SessionProvider>
          <TabsContent value={currentTab}>{renderTabContent()}</TabsContent>
        </SessionProvider>
      </div>
    </Tabs>
  );
}
