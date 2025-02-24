import { useLocalStorage } from "@/hooks/utils/useLocalStorage";
import { LToken, RewardsMint, execute } from "graphclient";
import { useCallback, useEffect, useState } from "react";

type SubgraphUserRewardsMints = {
  data: {
    [key: string]: [
      RewardsMint & {
        ltoken: LToken;
      },
    ];
  };
};

const CACHE_EXPIRY = 60 * 1000; // 60 seconds in milliseconds

/**
 * Hook for fetching and caching rewards mints events data
 */
export function useRewardsMintsData(
  appChainId: number,
  currentAccount: string | undefined,
) {
  const cacheKey = `rewards-mints-${appChainId}-${currentAccount}`;

  const {
    localData: cachedData,
    lastUpdate,
    setLocalData: setCachedData,
  } = useLocalStorage<{
    data: SubgraphUserRewardsMints | null;
    timestamp: number;
  }>(`${cacheKey}`, { data: null, timestamp: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchData = useCallback(
    async (force = false) => {
      // Don't fetch if no account or chain ID
      if (!currentAccount || !appChainId) {
        return null;
      }

      // Don't fetch if loading or if cache is still valid
      const now = Date.now();
      if (
        isLoading ||
        (!force && cachedData.data && now - cachedData.timestamp < CACHE_EXPIRY)
      ) {
        return cachedData.data;
      }

      setIsLoading(true);
      setError(undefined);

      try {
        const mintsEventsRequest = (await execute(
          `
        {
          c${appChainId}_rewardsMints(where: { account: "${currentAccount}" }, orderBy: timestamp, orderDirection: asc) {
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

        // Update cache
        setCachedData({
          data: mintsEventsRequest,
          timestamp: now,
        });

        setIsLoading(false);
        return mintsEventsRequest;
      } catch (e) {
        setError("Failed to fetch rewards mints data");
        console.error(e);
        setIsLoading(false);
        return null;
      }
    },
    [appChainId, currentAccount, cachedData, isLoading, setCachedData],
  );

  // Initial fetch on mount or when dependencies change
  useEffect(() => {
    if (currentAccount && appChainId) {
      // Only fetch if we don't have data or if cache is expired
      const now = Date.now();
      if (!cachedData.data || now - cachedData.timestamp >= CACHE_EXPIRY) {
        fetchData();
      }
    }
  }, [appChainId, currentAccount, fetchData, cachedData]);

  return {
    data: cachedData.data,
    isLoading,
    error,
    refetch: fetchData,
    lastUpdate: cachedData.timestamp,
  };
}
