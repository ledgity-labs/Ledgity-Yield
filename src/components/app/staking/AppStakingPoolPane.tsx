import { FC, useMemo } from "react";

import { CarouselItem } from "@/components/ui/Carousel";
import { TxButton } from "@/components/ui";
import { formatUnits } from "viem";
import {
  useSimulateLdyStakingGetReward,
  useSimulateLdyStakingUnstake,
} from "@/generated";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import { OneMonth, StakeDurations } from "@/data/oldConstants";
import { getAPRCalculation } from "@/lib/getAPRCalculation";
import { QueryKey } from "@tanstack/react-query";
import { getTimeLeftString } from "@/lib/utils";
import { UseSimulateContractReturnType } from "wagmi";

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);

export type PoolInfo = {
  stakedAmount: bigint;
  unStakeAt: bigint;
  duration: bigint;
  rewardPerTokenPaid: bigint;
  rewards: bigint;
};

export function AppStakingPoolPane({
  stakingInfo,
  poolIndex,
  ldyTokenDecimals,
  rewardsArray,
  rewardRate,
  totalWeightedStake,
  getUserStakesQuery,
  ldyTokenBalanceQuery,
  rewardsArrayQuery,
  ...props
}: {
  stakingInfo: PoolInfo;
  poolIndex: number;
  ldyTokenDecimals: number;
  rewardsArray: readonly bigint[] | undefined;
  rewardRate: number;
  totalWeightedStake: number;
  getUserStakesQuery?: QueryKey;
  ldyTokenBalanceQuery?: QueryKey;
  rewardsArrayQuery?: QueryKey;
}) {
  const unstakePreparation = useSimulateLdyStakingUnstake({
    args: [stakingInfo.stakedAmount, BigInt(poolIndex)],
  });

  const getRewardsPreparation = useSimulateLdyStakingGetReward({
    args: [BigInt(poolIndex)],
  });

  const memoizedUnstakePreparation = useMemo(() => {
    return unstakePreparation as unknown as UseSimulateContractReturnType;
  }, [
    unstakePreparation.data?.request,
    unstakePreparation.error,
    unstakePreparation.isLoading,
  ]);

  const memoizedGetRewardsPreparation = useMemo(() => {
    return getRewardsPreparation as unknown as UseSimulateContractReturnType;
  }, [
    getRewardsPreparation.data?.request,
    getRewardsPreparation.error,
    getRewardsPreparation.isLoading,
  ]);

  const formattedAmountRewards = Number(
    formatUnits(BigInt(stakingInfo.rewards), ldyTokenDecimals),
  ).toFixed(4);

  return (
    <CarouselItem className="px-2 md:basis-1/2 lg:basis-1/3">
      <div className="p-3 lg:p-4 rounded-lg bg-card-content-default">
        <div className="flex flex-col justify-start">
          <span className="font-semibold text-lg">Pool #{poolIndex + 1}</span>
          <div className="flex text-sm justify-between">
            <span>Staked Amount</span>
            <span className="font-semibold">
              {formatUnits(stakingInfo.stakedAmount, ldyTokenDecimals!)}
            </span>
          </div>
          <div className="flex text-sm justify-between">
            <span>Duration</span>
            <span className="font-semibold">
              {Number(stakingInfo.duration) / OneMonth} Months
            </span>
          </div>
          <div className="flex text-sm justify-between">
            <span>Unlock Timestamp</span>
            <span className="font-semibold">
              {dayjs
                .utc(Number(stakingInfo.unStakeAt) * 1000)
                .format("DD/MM/YYYY")}
            </span>
          </div>
          <div className="flex text-sm justify-between">
            <span>Earned</span>
            <span className="font-semibold">
              {`${formattedAmountRewards} LDY`}
            </span>
          </div>
          <div className="flex text-sm justify-between">
            <span>APY</span>
            <span className="font-semibold">
              {getAPRCalculation(
                rewardRate,
                totalWeightedStake,
                StakeDurations.findIndex((duration) => {
                  return duration == Number(stakingInfo.duration) / OneMonth;
                }),
              )}
              %
            </span>
          </div>
          <div className="flex text-sm justify-between">
            <span>Time Left</span>
            <span className="font-semibold">
              {getTimeLeftString(Number(stakingInfo.unStakeAt) * 1000)}
            </span>
          </div>
          <div className="flex py-1 w-full">
            <TxButton
              preparation={memoizedUnstakePreparation}
              variant="primary"
              size="tiny"
              disabled={dayjs().isBefore(Number(stakingInfo.unStakeAt) * 1000)}
              className="w-full"
              queryKeys={[
                ldyTokenBalanceQuery,
                getUserStakesQuery,
                rewardsArrayQuery,
              ]}
            >
              UNSTAKE
            </TxButton>
          </div>
          <div className="flex py-1 w-full">
            <TxButton
              preparation={memoizedGetRewardsPreparation}
              variant="outline"
              size="tiny"
              disabled={
                Number(
                  formatUnits(
                    BigInt(rewardsArray?.[poolIndex] || 0),
                    ldyTokenDecimals!,
                  ),
                ) < 0.0001
              }
              className="w-full"
              queryKeys={[rewardsArrayQuery, ldyTokenBalanceQuery]}
            >
              CLAIM{" "}
              {Number(
                formatUnits(
                  BigInt(rewardsArray?.[poolIndex] || 0),
                  ldyTokenDecimals!,
                ),
              ).toFixed(4)}{" "}
              Token
            </TxButton>
          </div>
        </div>
      </div>
    </CarouselItem>
  );
}
