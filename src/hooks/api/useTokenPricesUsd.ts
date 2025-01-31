import { useState, useEffect } from "react";

const symbolToId = [
  {
    id: "euro-coin",
    symbol: "eurc",
    name: "EURC",
  },
  {
    id: "tether",
    symbol: "usdt",
    name: "Tether",
  },
  {
    id: "usd-coin",
    symbol: "usdc",
    name: "USDC",
  },
] as const;

type CachedPrice = {
  price: number;
  timestamp: number;
};

type PriceMap = { [symbol: string]: number };

export function useTokenPricesUsd(tokenSymbols: string[]): PriceMap {
  const [prices, setPrices] = useState<PriceMap>({});

  const lowercaseSymbols = tokenSymbols.map((symbol) => symbol.toLowerCase());

  useEffect(() => {
    const fetchPrices = async () => {
      const now = Date.now();
      const thirtyMinutes = 30 * 60 * 1000;
      const result: PriceMap = {};
      const symbolsToFetch: string[] = [];
      const idsToFetch: string[] = [];

      // First check stablecoins and cached values
      for (const lowercaseSymbol of lowercaseSymbols) {
        // Handle stablecoins
        if (lowercaseSymbol === "usdt" || lowercaseSymbol === "usdc") {
          result[lowercaseSymbol] = 1;
          continue;
        }

        // Check cache
        const storageKey = `token_price_${lowercaseSymbol}`;
        const cached = localStorage.getItem(storageKey);

        if (cached) {
          const cachedData: CachedPrice = JSON.parse(cached);
          if (now - cachedData.timestamp < thirtyMinutes) {
            result[lowercaseSymbol] = cachedData.price;
            continue;
          }
        }

        // Need to fetch this token
        const id = symbolToId.find(
          (item) => item.symbol === lowercaseSymbol,
        )?.id;
        if (id) {
          symbolsToFetch.push(lowercaseSymbol);
          idsToFetch.push(id);
        } else {
          console.error(`Failed to find id for symbol: ${lowercaseSymbol}`);
          result[lowercaseSymbol] = cached ? JSON.parse(cached).price : 0;
        }
      }

      // If we have tokens to fetch, do it in one API call
      if (idsToFetch.length > 0) {
        try {
          const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch.join(",")}&vs_currencies=usd`,
            {
              headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br, zstd",
              },
            },
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Process each fetched token
          symbolsToFetch.forEach((symbol, index) => {
            const id = idsToFetch[index];
            const price = data[id]?.usd ?? 0;

            // Cache the new price
            const cacheData: CachedPrice = {
              price,
              timestamp: now,
            };
            localStorage.setItem(
              `token_price_${symbol}`,
              JSON.stringify(cacheData),
            );
            result[symbol] = price;
          });
        } catch (err) {
          console.error("Failed to fetch prices:", err);
          // Fall back to cached values for failed fetches
          symbolsToFetch.forEach((symbol) => {
            const cached = localStorage.getItem(`token_price_${symbol}`);
            result[symbol] = cached ? JSON.parse(cached).price : 0;
          });
        }
      }

      setPrices(result);
    };

    fetchPrices();
  }, [tokenSymbols.join(",")]); // Only refetch if the token list changes

  return prices;
}
