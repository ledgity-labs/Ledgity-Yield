import { FC, useEffect } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/Carousel";
import { useGetUserStakingsByAddress } from "@/services/graph";
import { useAccount, usePublicClient } from "wagmi";
import { formatUnits, zeroAddress } from "viem";
import {
  useReadLdyStakingGetEarnedUser,
  useReadLdyStakingGetUserStakes,
} from "@/generated";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { twMerge } from "tailwind-merge";
import { USER_STAKING_QUERY } from "@/services/graph/queries";
import { AppStakingPoolPane } from "./AppStakingPoolPane";

export const AppStakingPools: FC<{
  ldyTokenDecimals: number;
  ldyTokenBalance: bigint;
  ldyTokenBalanceQuery: QueryKey;
  rewardRate: number;
  totalWeightedStake: number;
}> = ({
  ldyTokenDecimals,
  ldyTokenBalance,
  ldyTokenBalanceQuery,
  rewardRate,
  totalWeightedStake,
}) => {
  const queryClient = useQueryClient();
  const account = useAccount();
  const publicClient = usePublicClient();

  // @bw graph implementation
  // Fetch user staking info including earnedAmount from subgraph
  const {
    data: userStakingInfo,
    refetch: refetchUserStakingInfo,
    isFetching: isFetchingStakingInfo,
  } = useGetUserStakingsByAddress(account.address || zeroAddress);

  // Fetch user staking info from ldyStaking contract
  const { data: stakingPools, queryKey: getUserStakesQuery } =
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

  // Refetch staking info(earned info) on rewardsArray change
  useEffect(() => {
    // Refetch after 3 seconds due to subgraph latency
    const timeoutId = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: [USER_STAKING_QUERY] });
    }, 3000);
    return () => clearTimeout(timeoutId);
  }, [rewardsArray]);

  return (
    <div className="flex flex-col justify-start gap-y-2 p-4 h-full">
      <div className="font-heading font-bold text-xl text-white">
        MY $LDY POOLS
      </div>
      <Carousel
        className={twMerge(
          "w-full justify-center",
          (!stakingPools || !stakingPools.length) && "hidden",
        )}
      >
        <CarouselContent className="-ml-1">
          {stakingPools?.map((poolInfo, index) => (
            <AppStakingPoolPane
              key={index}
              poolInfo={poolInfo}
              poolIndex={index}
              ldyTokenDecimals={ldyTokenDecimals ? ldyTokenDecimals : 18}
              userStakingInfo={
                userStakingInfo &&
                userStakingInfo.stakingUsers &&
                userStakingInfo.stakingUsers[index]
                  ? userStakingInfo.stakingUsers[index]
                  : undefined
              }
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
    </div>
  );
};
