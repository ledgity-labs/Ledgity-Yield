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

export async function fetchTokenPriceUsd(tokenSymbol: string): Promise<number> {
  const symbol = tokenSymbol.toLowerCase();

  // Return 1 for stablecoins
  if (symbol === "usdt" || symbol === "usdc") {
    return 1;
  }

  // Check local storage first
  const storageKey = `token_price_${symbol}`;
  const cached = localStorage.getItem(storageKey);

  if (cached) {
    const cachedData: CachedPrice = JSON.parse(cached);
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    // If cache is less than 30 minutes old, use it
    if (now - cachedData.timestamp < thirtyMinutes) {
      return cachedData.price;
    }
  }

  // If we get here, we need to fetch fresh data
  try {
    const id = symbolToId.find((item) => item.symbol === symbol)?.id;

    if (!id) {
      throw Error(`Failed to find id for symbol: ${symbol}`);
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`,
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
    const newPrice = data[id]?.usd ?? 0;

    // Cache the new price
    const cacheData: CachedPrice = {
      price: newPrice,
      timestamp: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(cacheData));
    return newPrice;
  } catch (error) {
    console.error("Failed to fetch price:", error);
    // If we have cached data, use it even if it's old
    if (cached) return JSON.parse(cached).price;

    return 0;
  }
}
