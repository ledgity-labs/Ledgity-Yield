import { Metadata } from "next";
import { AppTabs } from "./AppTabs";

export function generateStaticParams() {
  const tabs = ["dashboard", "invest", "airdrop", "get-usdc", "pre-mining"];

  return tabs.map((tab) => ({
    tab: tab,
  }));
}

type Props = {
  params: { tab: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const title = {
    "dashboard": "Dashboard",
    "invest": "Invest",
    "airdrop": "Multi-Airdrop",
    "get-usdc": "Get USDC",
    // "pre-mining": "Pre-Mining",
    "staking": "Staking",
    "affiliate": "Affiliate Program",
  }[params.tab];

  const description = {
    "airdrop":
      "16% of 1-year $LDY supply and tokens from 5+ projects are airdropepd to our early community members. Complete tasks and check your eligibility.",
    "pre-mining":
      "Contribute in bootstraping initial protocol liquidity and receive very first $LDY tokens.",
  }[params.tab];

  const keywords = {
    airdrop: [
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
    // "pre-mining": [
    //   "Ledgity Yield Pre-Mining",
    //   "Ledgity Pre-Mining",
    //   "RWA",
    //   "Stablecoins",
    //   "Yield",
    //   "Liquid staking",
    //   "Real World Assets",
    // ],
  }[params.tab];

  return {
    title: `Ledgity Yield • ${title}`,
    description: description,
    keywords: keywords,
  };
}

//@ts-ignore
const Page: NextPage = ({ params }: { params: { tab: string } }) => {
  return <AppTabs />;
};

export default Page;
