import { FC, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import {
  useReadLdyStakingGetEarnedUser,
  useReadLdyStakingGetUserStakes,
} from "@/types";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { zeroAddress } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { AppStakingPoolPane } from "./AppStakingPoolPane";

export function AppStakingPools({
  ldyTokenDecimals,
  ldyTokenBalance,
  ldyTokenBalanceQuery,
  rewardRate,
  totalWeightedStake,
}: {
  ldyTokenDecimals: number;
  ldyTokenBalance: bigint;
  ldyTokenBalanceQuery: QueryKey;
  rewardRate: number;
  totalWeightedStake: number;
}) {
  const queryClient = useQueryClient();
  const account = useAccount();
  const publicClient = usePublicClient();

  // Fetch user staking info from ldyStaking contract
  const { data: stakingInfos, queryKey: getUserStakesQuery } =
    useReadLdyStakingGetUserStakes({
      args: [account.address || zeroAddress],
    });

  // Fetch claimable rewards array from ldyStaking Contract
  const { data: rewardsArray, queryKey: rewardsArrayQuery } =
    useReadLdyStakingGetEarnedUser({
      args: [account.address || zeroAddress],
    });

  // Refetch staking info, earned array from contracts on wallet, network change
  const queryKeys = [rewardsArrayQuery, getUserStakesQuery];
  useEffect(() => {
    queryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
  }, [account.address, publicClient, ldyTokenBalance]);

  return (
    <div className="flex flex-col justify-start gap-y-2 p-4 h-full">
      <div className="font-heading font-bold text-xl text-white">
        MY $LDY POOLS
      </div>
      {stakingInfos?.length && (
        <Carousel className="w-full justify-center">
          <CarouselContent className="-ml-1">
            {stakingInfos.map((stakingInfo, i) => (
              <AppStakingPoolPane
                key={i}
                stakingInfo={stakingInfo}
                poolIndex={i}
                ldyTokenDecimals={ldyTokenDecimals ? ldyTokenDecimals : 18}
                rewardsArray={rewardsArray ? rewardsArray : undefined}
                rewardRate={rewardRate}
                totalWeightedStake={totalWeightedStake}
                getUserStakesQuery={getUserStakesQuery}
                ldyTokenBalanceQuery={ldyTokenBalanceQuery}
                rewardsArrayQuery={rewardsArrayQuery}
              />
            ))}
          </CarouselContent>
          <CarouselPrevious size="tiny" />
          <CarouselNext size="tiny" />
        </Carousel>
      )}
    </div>
  );
}
