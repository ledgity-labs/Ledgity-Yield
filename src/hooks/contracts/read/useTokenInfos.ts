// Hooks
import { useReadContracts } from "wagmi";
import { useEffect, useState } from "react";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { useLocalStorage } from "@/hooks/utils/useLocalStorage";
// Data
import { zeroAddress } from "viem";
// Types
import { TokenInfo, genericErc20Abi } from "@/types";

const NB_DATA_POINTS = 3;

export function useTokenInfos(
  tokenAddresses: (`0x${string}` | undefined)[],
): TokenInfo[] {
  const { appChainId } = useWeb3Context();
  const [currentValue, setCurrentValue] = useState<TokenInfo[]>([]);

  const { localData, setLocalData } = useLocalStorage<TokenInfo[]>(
    "tokenInfo",
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
        abi: genericErc20Abi,
        chainId: appChainId,
        functionName: "name",
      },
      {
        address,
        abi: genericErc20Abi,
        chainId: appChainId,
        functionName: "symbdol",
      },
      {
        address,
        abi: genericErc20Abi,
        chainId: appChainId,
        functionName: "decimals",
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

    const formattedData: TokenInfo[] = [];

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
      });
    }

    if (JSON.stringify(formattedData) !== JSON.stringify(currentValue)) {
      setCurrentValue(formattedData);
      setLocalData(formattedData);
    }
  }, [data, error, currentValue]);

  return currentValue;
}
