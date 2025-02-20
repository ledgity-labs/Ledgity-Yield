import { lTokenAbi } from "@/types";
import { useReadContracts } from "wagmi";
import { LTokenInfo } from "../../types";
import { zeroAddress } from "viem";
import { useEffect, useState } from "react";

export function useLTokenInfos(
  tokenAddresses: (`0x${string}` | undefined)[],
  userAddress?: `0x${string}`,
): LTokenInfo[] {
  const [currentValue, setCurrentValue] = useState<LTokenInfo[]>([]);

  const tokensFiltered = [...new Set(tokenAddresses)].filter(
    (address) =>
      address !== "0x0000000000000000000000000000000000000000" &&
      address !== undefined,
  );

  const calls = tokensFiltered?.flatMap((tokenAddress) => {
    const address = tokenAddress ?? zeroAddress;
    return [
      {
        address,
        abi: lTokenAbi,
        functionName: "name",
      },
      {
        address,
        abi: lTokenAbi,
        functionName: "symbol",
      },
      {
        address,
        abi: lTokenAbi,
        functionName: "decimals",
      },
      {
        address,
        abi: lTokenAbi,
        functionName: "getAPR",
      },
      {
        address,
        abi: lTokenAbi,
        functionName: "totalSupply",
      },
      {
        address,
        abi: lTokenAbi,
        functionName: "balanceOf",
        args: [userAddress ?? zeroAddress],
      },
    ] as const;
  });

  const rawData = useReadContracts({
    query: {
      refetchInterval: 30 * 1000,
    },
    contracts: calls,
  });

  useEffect(() => {
    if (rawData.error || !rawData?.data) {
      return;
    }

    const formattedData: LTokenInfo[] = [];

    for (let i = 0; i < rawData.data.length; i += 6) {
      const addressIndex = Math.floor(i / 6);
      const address = tokenAddresses?.[addressIndex] ?? zeroAddress;

      if (
        !address ||
        rawData.data
          .slice(i, i + 6)
          .some((data) => data.result === undefined) ||
        rawData.data.slice(i, i + 6).some((data) => data.error !== undefined)
      ) {
        continue;
      }

      formattedData.push({
        address,
        name: rawData.data[i].result as string,
        symbol: rawData.data[i + 1].result as string,
        decimals: rawData.data[i + 2].result as number,
        apr: rawData.data[i + 3].result as number,
        totalSupply: rawData.data[i + 4].result as bigint,
        balance: userAddress ? (rawData.data[i + 5].result as bigint) : 0n,
      });
    }

    if (JSON.stringify(formattedData) !== JSON.stringify(currentValue)) {
      setCurrentValue(formattedData);
    }
  }, [rawData, tokenAddresses, userAddress, currentValue]);

  return currentValue;
}
