import { Metadata, NextPage } from "next";
import { AppTabs, TabParam } from "./AppTabs";

const tabParams: TabParam[] = [
  {
    tab: "invest",
    title: "Invest",
  },
  {
    tab: "staking",
    title: "Staking",
  },
  {
    tab: "dashboard",
    title: "Dashboard",
  },
  {
    tab: "affiliate",
    title: "Affiliate Program",
  },
  {
    tab: "swap",
    title: "Swap",
  },
  {
    tab: "bridge",
    title: "Bridge",
  },
  {
    tab: "pre-mining",
    title: "Pre-Mining",
    description:
      "Contribute in bootstraping initial protocol liquidity and receive very first $LDY tokens.",
    keywords: [
      "Ledgity Yield Pre-Mining",
      "Ledgity Pre-Mining",
      "RWA",
      "Stablecoins",
      "Yield",
      "Liquid staking",
      "Real World Assets",
    ],
    isHidden: true,
  },
  {
    tab: "airdrop",
    title: "Multi-Airdrop",
    description:
      "16% of 1-year $LDY supply and tokens from 5+ projects are airdropepd to our early community members. Complete tasks and check your eligibility.",
    keywords: [
      "Airdrop",
      "Ledgity Airdrop",
      "Ledgity Multi-Airdrop",
      "Ledgity Yield Airdrop",
      "Ledgity Yield Multi-Airdrop",
      "RWA",
      "Stablecoins",
      "Yield",
      "Liquid staking",
      "Real World Assets",
    ],
    isHidden: true,
  },

  {
    tab: "get-usdc",
    title: "Get USDC",
    isHidden: true,
  },
];

export function generateStaticParams() {
  // Only generate active tabs
  return tabParams.filter((tab) => !tab.isHidden).map(({ tab }) => ({ tab }));
}

export async function generateMetadata({
  params,
}: {
  params: { tab: string };
}): Promise<Metadata> {
  // Find the tab configuration
  const tabConfig = tabParams.find((t) => t.tab === params.tab) || {
    tab: params.tab,
    title: params.tab.charAt(0).toUpperCase() + params.tab.slice(1),
  };

  return {
    title: `Ledgity Yield • ${tabConfig.title}`,
    description: tabConfig.description || undefined,
    keywords: tabConfig.keywords || undefined,
  };
}

function Page() {
  return <AppTabs tabParams={tabParams} />;
}

export default Page;
