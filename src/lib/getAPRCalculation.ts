import {
  OneMonth,
  StakeDurationMultipliers,
  MULTIPLIER_BASIS,
} from "@/data/oldConstants";
import { parseUnits } from "viem";

export const getAPRCalculation = (
  rewardRatePerSec: number,
  totalWeightedStake: number,
  stakeDurationIndex: number,
) => {
  const OneToken = Number(parseUnits("1", 18));
  const OneYear = 12 * OneMonth;

  const rewardRatePerYear = rewardRatePerSec * OneYear;
  const multiplier = StakeDurationMultipliers[stakeDurationIndex];
  const myStakeAmount = (OneToken * multiplier) / MULTIPLIER_BASIS;
  if (totalWeightedStake == 0) {
    totalWeightedStake = myStakeAmount;
  }
  const myPortion = myStakeAmount / totalWeightedStake;
  const rewardsAmountPerYear = rewardRatePerYear * myPortion;
  const APR = (rewardsAmountPerYear / OneToken) * 100;
  return APR.toFixed(2);
};
