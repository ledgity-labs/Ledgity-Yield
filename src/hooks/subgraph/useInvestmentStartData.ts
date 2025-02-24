import { useLocalStorage } from "@/hooks/utils/useLocalStorage";
import { Activity, LToken, execute } from "graphclient";
import { useCallback, useEffect, useState } from "react";

type SubgraphUserInvestmentActivity = {
  data: {
    [key: string]: LToken[] & {
      activities: Activity[];
    };
  };
};

const CACHE_EXPIRY = 60 * 1000; // 60 seconds in milliseconds

/**
 * Hook for fetching and caching investment start data
 */
export function useInvestmentStartData(
  appChainId: number,
  currentAccount: string | undefined,
) {
  const cacheKey = `investment-start-${appChainId}-${currentAccount}`;

  const {
    localData: cachedData,
    lastUpdate,
    setLocalData: setCachedData,
  } = useLocalStorage<{
    data: SubgraphUserInvestmentActivity | null;
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
        const investmentStartRequest = (await execute(
          `
        {
          c${appChainId}_ltokens {
            symbol
            activities(where: {account: "${currentAccount}"}, orderBy: timestamp, orderDirection: asc, first: 1) {
              timestamp
            }
          }
        }
        `,
          {},
        )) as SubgraphUserInvestmentActivity;

        // Update cache
        setCachedData({
          data: investmentStartRequest,
          timestamp: now,
        });

        setIsLoading(false);
        return investmentStartRequest;
      } catch (e) {
        setError("Failed to fetch investment start data");
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
