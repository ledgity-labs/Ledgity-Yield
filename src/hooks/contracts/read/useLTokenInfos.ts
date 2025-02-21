// Hooks
import { useReadContracts } from "wagmi";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/utils/useLocalStorage";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
// Datas
import { zeroAddress } from "viem";
// Types
import { lTokenAbi, LTokenInfo } from "@/types";

const NB_DATA_POINTS = 6;

export function useLTokenInfos(
  tokenAddresses: (`0x${string}` | undefined)[],
  userAddress?: `0x${string}`,
): LTokenInfo[] {
  const { appChainId } = useWeb3Context();
  const [currentValue, setCurrentValue] = useState<LTokenInfo[]>([]);

  const { localData, setLocalData } = useLocalStorage<LTokenInfo[]>(
    "ltokenInfo",
    [],
  );

  useEffect(() => {
    if (!currentValue.length && localData.length) setCurrentValue(localData);
  }, [currentValue]);

  useEffect(() => {
    setLocalData([]);
    setCurrentValue([]);
  }, [appChainId]);

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

  const { data, error } = useReadContracts({
    query: {
      refetchInterval: 30 * 1000,
    },
    contracts: calls,
  });

  useEffect(() => {
    if (error || !data) {
      return;
    }

    const formattedData: LTokenInfo[] = [];

    for (let i = 0; i < data.length; i += NB_DATA_POINTS) {
      const addressIndex = Math.floor(i / NB_DATA_POINTS);
      const address = tokenAddresses?.[addressIndex] ?? zeroAddress;

      if (
        !address ||
        data
          .slice(i, i + NB_DATA_POINTS)
          .some((data) => data.result === undefined) ||
        data
          .slice(i, i + NB_DATA_POINTS)
          .some((data) => data.error !== undefined)
      ) {
        continue;
      }

      formattedData.push({
        address,
        name: data[i].result as string,
        symbol: data[i + 1].result as string,
        decimals: data[i + 2].result as number,
        apr: data[i + 3].result as number,
        totalSupply: data[i + 4].result as bigint,
        balance: userAddress ? (data[i + 5].result as bigint) : 0n,
      });
    }

    if (JSON.stringify(formattedData) !== JSON.stringify(currentValue)) {
      setCurrentValue(formattedData);
      setLocalData(formattedData);
    }
  }, [data, error, userAddress, currentValue]);

  return currentValue;
}
