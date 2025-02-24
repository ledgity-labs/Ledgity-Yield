import { useState, useEffect, useCallback } from "react";
import { Activity, LToken, RewardsMint, execute } from "graphclient";
import { formatUnits } from "viem";
import { readLToken } from "@/types";
import { wagmiConfig } from "@/config/wagmi";
import { fetchTokenPriceUsd } from "@/functions/fetchTokenPriceUsd";
import { useAppDataContext } from "@/hooks/context/AppDataContextProvider";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { useInvestmentStartData } from "@/hooks/subgraph/useInvestmentStartData";
import { useRewardsMintsData } from "@/hooks/subgraph/useRewardsMintsData";

type TokenData = {
  [ltokenNames: string]: {
    timestamp: number;
    revenue: number;
    balanceBefore: number;
    growth: number;
  }[];
};

/**
 * Combined hook that uses both data sources - can be used as a replacement for your original hook
 */
export function useGrowthRevenueData(): {
  growthData: TokenData;
  isDataLoading: boolean;
  isDataError: boolean;
  dataErrorMessage?: string;
} {
  const { currentAccount, appChainId } = useWeb3Context();
  const { lTokenInfosCurrentChain } = useAppDataContext();

  // Use our cached query hooks
  const {
    data: investmentStartData,
    isLoading: isInvestmentDataLoading,
    error: investmentDataError,
  } = useInvestmentStartData(appChainId, currentAccount);

  const {
    data: rewardsMintsData,
    isLoading: isRewardsMintsLoading,
    error: rewardsMintsError,
  } = useRewardsMintsData(appChainId, currentAccount);

  // Calculate the final data similarly to your original hook
  const [processedData, setProcessedData] = useState<TokenData>({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Process data when the query results change
  useEffect(() => {
    const processData = async () => {
      if (!currentAccount || !appChainId || isProcessing) return;
      if (!investmentStartData?.data && !rewardsMintsData?.data) return;

      setIsProcessing(true);

      try {
        const newData: TokenData = {};

        // Process investment start data
        if (investmentStartData?.data) {
          const investmentStartItems =
            investmentStartData.data[`c${appChainId}_ltokens`];

          // Push investment start as first data point
          for (const lToken of investmentStartItems || []) {
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
        }

        // Process rewards mints data
        if (rewardsMintsData?.data) {
          const mintsEventsItems =
            rewardsMintsData.data[`c${appChainId}_rewardsMints`];

          for (const rewardsMint of mintsEventsItems || []) {
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

            newData[rewardsMint.ltoken.symbol] ??= [];
            newData[rewardsMint.ltoken.symbol].push({
              timestamp: Number(rewardsMint.timestamp),
              revenue: revenue,
              balanceBefore: balanceBefore,
              growth: Number(rewardsMint.growth),
            });
          }
        }

        // Process not yet minted rewards (same as original hook)
        for (const lToken of lTokenInfosCurrentChain) {
          const underlyingSymbol = lToken.symbol.slice(1);
          const lTokenAddress = lToken.address;
          const decimals = lToken.decimals;

          const [balanceBeforeBigInt, unclaimedRewards, usdRate] =
            await Promise.all([
              readLToken(wagmiConfig, {
                address: lTokenAddress,
                functionName: "realBalanceOf",
                args: [currentAccount],
              }).catch(() => BigInt(0)),
              readLToken(wagmiConfig, {
                address: lTokenAddress,
                functionName: "unmintedRewardsOf",
                args: [currentAccount],
              }).catch(() => BigInt(0)),
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

          newData[lToken.symbol] ??= [];
          newData[lToken.symbol].push({
            timestamp,
            revenue,
            balanceBefore,
            growth,
          });
        }

        setProcessedData(newData);
      } catch (e) {
        console.error("Error processing data:", e);
      }

      setIsProcessing(false);
    };

    processData();
  }, [
    investmentStartData,
    rewardsMintsData,
    currentAccount,
    appChainId,
    lTokenInfosCurrentChain,
  ]);

  return {
    growthData: processedData,
    isDataLoading:
      isInvestmentDataLoading || isRewardsMintsLoading || isProcessing,
    isDataError: !!investmentDataError || !!rewardsMintsError,
    dataErrorMessage: investmentDataError || rewardsMintsError,
  };
}
