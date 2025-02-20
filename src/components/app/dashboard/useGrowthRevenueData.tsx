import { readLToken } from "@/types";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { wagmiConfig } from "../../../config/wagmi";
import { getContractAddress } from "@/lib/getContractAddress";
import { Activity, LToken, RewardsMint, execute } from "graphclient";
import { useCallback, useEffect, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
// Functions
import { fetchTokenPriceUsd } from "../../../functions/fetchTokenPriceUsd";

type TokenData = {
  [ltokenNames: string]: {
    timestamp: number;
    revenue: number;
    balanceBefore: number;
    growth: number;
  }[];
};

type Data = {
  [chainId: number]: {
    timestamp: number;
    data: TokenData;
  };
};

type SubgraphUserInvestmentActivity = {
  data: {
    [key: string]: LToken[] & {
      activities: Activity[];
    };
  };
};

type SubgraphUserRewardsMints = {
  data: {
    [key: string]: [
      RewardsMint & {
        ltoken: LToken;
      },
    ];
  };
};

const CACHE_MAX_AGE = 60 * 10; // seconds

export function useGrowthRevenueData(): {
  growthData: TokenData;
  isDataLoading: boolean;
  isDataError: boolean;
  dataErrorMessage?: string;
} {
  const lTokens = useAvailableLTokens();
  const currentChain = useCurrentChain();
  const account = useAccount();
  const [data, setData] = useState<Data>({});
  const chainData = data[account?.chainId || 0]?.data || {};
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [dataErrorMessage, setDataErrorMessage] = useState<string>();

  const computeData = useCallback(async () => {
    const previousData = data?.[account?.chainId || 0];

    if (
      isDataLoading ||
      !account?.address ||
      !account?.chainId ||
      !currentChain ||
      (previousData &&
        Date.now() / 1000 - previousData.timestamp < CACHE_MAX_AGE)
    ) {
      setIsDataLoading(false);
      return;
    }

    setIsDataLoading(true);
    setDataErrorMessage(undefined);

    try {
      // Retrieve investments start timestamps for each L-Token
      const investmentStartRequest = (await execute(
        `
      {
        c${account.chainId}_ltokens {
          symbol
          activities(where: {account: "${
            account.address
          }" }, orderBy: timestamp, orderDirection: asc, first: 1) {
            timestamp
          }
        }
      }
      `,
        {},
      ).catch((e) => {
        throw Error("Failed to fetch investment start data");
      })) as SubgraphUserInvestmentActivity;

      const investmentStartData =
        investmentStartRequest?.data?.[`c${account.chainId}_ltokens`];
      if (!investmentStartData) {
      }

      // Convert revenue to decimals and then to USD
      const timestamp = Math.floor(Date.now() / 1000);
      // If data cache doesn't exist or isn't valid anymore
      // Else compute new data
      const newData: TokenData = {};

      // Push investment start as first data point
      for (const lToken of investmentStartData) {
        if (lToken.activities && lToken.activities.length > 0) {
          newData[lToken.symbol] ??= [];

          newData[lToken.symbol].push({
            timestamp: Number(lToken.activities[0].timestamp),
            revenue: 0,
            balanceBefore: 0,
            growth: 0,
          });
        }
      }

      // Retrieve all rewards mints events data

      const mintsEventsRequest = (await execute(
        `
      {
        c${account.chainId}_rewardsMints(where: { account: "${
          account.address
        }" }, orderBy: timestamp, orderDirection: asc) {
          timestamp
          revenue
          growth
          balanceBefore
          ltoken {
            id
            symbol
            decimals
          }
        }
      }
      `,
        {},
      )) as SubgraphUserRewardsMints;

      // Push each reward mint as data point
      const mintsEventsData =
        mintsEventsRequest?.data?.[`c${account.chainId}_rewardsMints`];

      if (!mintsEventsData) {
        setIsDataLoading(false);
        // Update data
        setData({
          ...data,
          [account.chainId]: {
            timestamp,
            data: newData,
          },
        });
        return;
      }

      for (const rewardsMint of mintsEventsData) {
        const usdRate = await fetchTokenPriceUsd(
          rewardsMint.ltoken.symbol.slice(1),
        );

        // Convert revenue to decimals and then to USD
        const revenue =
          Number(
            formatUnits(
              BigInt(rewardsMint.revenue),
              rewardsMint.ltoken.decimals,
            ),
          ) * usdRate;

        // Convert balance before to decimals and then to USD
        let balanceBefore = Number(
          formatUnits(
            BigInt(rewardsMint.balanceBefore),
            rewardsMint.ltoken.decimals,
          ),
        );
        balanceBefore = balanceBefore * usdRate;

        newData[rewardsMint.ltoken.symbol].push({
          timestamp: Number(rewardsMint.timestamp),
          revenue: revenue,
          balanceBefore: balanceBefore,
          growth: Number(rewardsMint.growth),
        });
      }

      // Push not yet minted rewards as data point
      for (const lToken of lTokens) {
        const underlyingSymbol = lToken.slice(1);
        const lTokenAddress = getContractAddress(lToken, currentChain.id)!;

        const [decimals, balanceBeforeBigInt, unclaimedRewards, usdRate] =
          await Promise.all([
            readLToken(wagmiConfig, {
              address: lTokenAddress,
              functionName: "decimals",
            }),
            readLToken(wagmiConfig, {
              address: lTokenAddress,
              functionName: "realBalanceOf",
              args: [account.address],
            }),
            readLToken(wagmiConfig, {
              address: lTokenAddress,
              functionName: "unmintedRewardsOf",
              args: [account.address],
            }),
            fetchTokenPriceUsd(underlyingSymbol),
          ]);

        // Convert revenue to decimals and then to USD
        const timestamp = Math.floor(Date.now() / 1000);
        const revenue =
          Number(formatUnits(unclaimedRewards, decimals)) * usdRate;

        // Convert balance before to decimals and then to USD
        const formattedBalanceBefore = Number(
          formatUnits(balanceBeforeBigInt, decimals),
        );
        const balanceBefore = formattedBalanceBefore * usdRate;
        const growth = balanceBefore ? revenue / balanceBefore : 0;

        newData[lToken].push({
          timestamp,
          revenue,
          balanceBefore,
          growth,
        });
      }

      // Update data
      setData({
        ...data,
        [account.chainId]: {
          timestamp,
          data: newData,
        },
      });
      setIsDataLoading(false);
    } catch (e) {
      console.error(e);
      setIsDataLoading(false);
      setDataErrorMessage("An error occurred");
    }
  }, [account.address, currentChain]);

  useEffect(() => {
    computeData().catch((e) => {
      console.error(e);
    });
  }, [computeData]);

  return {
    growthData: chainData,
    isDataLoading,
    isDataError: !!dataErrorMessage,
    dataErrorMessage,
  };
}
