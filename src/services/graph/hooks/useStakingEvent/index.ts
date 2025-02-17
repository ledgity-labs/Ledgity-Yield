import { Address } from "viem";
import { useGraphEvent } from "../useGraphEvent";
import {
  STAKING_APR_INFO_QUERY,
  USER_STAKING_QUERY,
} from "@/services/graph/queries";

export interface IUserStakingInfo {
  id: string;
  user: Address;
  earnedAmount: string;
  stakedAmount: string;
  stakeIndex: string;
}

export interface IStakingAPRInfo {
  rewardPerSec: string;
  totalStaked: string;
  interestRate: string;
}

// @bw graph hooks
export const useGetUserStakingsByAddress = (
  user: Address,
): {
  data: {
    stakingUsers: IUserStakingInfo[];
  };
  refetch: () => Promise<unknown>;
  isFetching: boolean;
} => {
  const { data, refetch, isFetching } = useGraphEvent(USER_STAKING_QUERY, {
    userAddress: user.toLocaleLowerCase(),
  });
  return { data, refetch, isFetching };
};

export const useGetStakingAprById = (
  id: string,
): {
  data: {
    stakingAPRInfo: IStakingAPRInfo;
  };
  refetch: () => Promise<unknown>;
  isFetching: boolean;
} => {
  const { data, refetch, isFetching } = useGraphEvent(STAKING_APR_INFO_QUERY, {
    stakeAprId: id,
  });
  return { data, refetch, isFetching };
};
