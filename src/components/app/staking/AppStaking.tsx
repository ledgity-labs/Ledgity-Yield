import { Card } from "@/components/ui";
import { FC, useEffect } from "react";
import { AppStakingPane } from "./AppStakingPane";
import { AppStakingDescription } from "./AppStakingDescription";
import { AppStakingPools } from "./AppStakingPools";
import { useContractAddress } from "@/hooks/useContractAddress";
import { usePublicClient, useReadContract } from "wagmi";
import { erc20Abi, zeroAddress } from "viem";
import {
  useReadLdyStakingRewardRatePerSec,
  useReadLdyStakingTotalWeightedStake,
} from "@/types";
// Hooks
import { useBalanceOf } from "@/hooks/contracts";
import { useQueryClient } from "@tanstack/react-query";
// Context
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";

export const AppStaking: FC = () => {
  const { currentAccount } = useWeb3Context();
  const queryClient = useQueryClient();
  const publicClient = usePublicClient();
  const ldySymbol = "LDY";
  const ldyTokenAddress = useContractAddress(ldySymbol);

  const ldyBalance = useBalanceOf(ldyTokenAddress, currentAccount);

  const { data: rewardRate, queryKey: rewardRateQuery } =
    useReadLdyStakingRewardRatePerSec();
  const { data: totalWeightedStake, queryKey: totalWeightedStakeQuery } =
    useReadLdyStakingTotalWeightedStake();
  const apyQueryKeys = [rewardRateQuery, totalWeightedStakeQuery];

  useEffect(() => {
    apyQueryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
  }, [currentAccount, publicClient, ldyBalance]);

  return (
    <section className="lg:w-[1080px] grid grid-cols-12 gap-5 pb-10 w-full h-full px-2">
      <Card
        circleIntensity={0.07}
        defaultGradient={true}
        className="w-full flex flex-col col-span-12 xl:col-span-6 gap-2 p-2"
      >
        <AppStakingPane
          ldyTokenSymbol={ldySymbol}
          ldyTokenAddress={ldyTokenAddress || zeroAddress}
          ldyTokenBalance={ldyBalance || 0n}
          ldyTokenDecimals={18}
          rewardRate={Number(rewardRate) || 0}
          totalWeightedStake={Number(totalWeightedStake) || 0}
        />
      </Card>
      <Card
        circleIntensity={0.07}
        defaultGradient={true}
        className="w-full flex flex-col col-span-12 xl:col-span-6 gap-8 p-2"
      >
        <AppStakingDescription />
      </Card>
      <Card
        circleIntensity={0.07}
        defaultGradient={false}
        className="w-full flex flex-col gap-8 col-span-12 before:bg-primary p-2"
      >
        <AppStakingPools
          ldyTokenDecimals={18}
          ldyTokenBalance={ldyBalance || 0n}
          ldyTokenBalanceQuery={[]}
          rewardRate={Number(rewardRate) || 0}
          totalWeightedStake={Number(totalWeightedStake) || 0}
        />
      </Card>
    </section>
  );
};
