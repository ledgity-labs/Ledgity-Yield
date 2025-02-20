import { lTokenAbi } from "@/types";
import { useReadContracts } from "wagmi";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { getContractAddress } from "@/lib/getContractAddress";

// @bw wtf is this doing here ?
const availableChains = [42161, 59144, 8453];

export function useLTokenMultichainTvl(): {
  symbol: string;
  totalTvl: bigint;
  chainData: {
    chainId: number;
    address: `0x${string}`;
    totalSupply: bigint;
  }[];
}[] {
  const lTokens = useAvailableLTokens();

  const ltokenChainAddresses = lTokens.map((lToken) =>
    availableChains
      .map((chainId) => {
        const address = getContractAddress(lToken, chainId);

        if (!address) return undefined;

        return {
          chainId,
          address,
        };
      })
      .filter((data) => data !== undefined),
  );

  const calls = ltokenChainAddresses.flat().map(({ chainId, address }) => ({
    address,
    abi: lTokenAbi,
    functionName: "totalSupply",
    chainId,
  })) as {
    address: `0x${string}`;
    abi: any;
    functionName: "totalSupply";
    chainId: number;
  }[];

  try {
    const result = useReadContracts({
      query: {
        refetchInterval: 30 * 1000,
      },
      contracts: calls,
    });

    if (result.error) {
      throw Error("Error fetching lToken tvl");
    }

    let resultIndex = 0;

    return lTokens.map((symbol, i) => {
      const chainData = ltokenChainAddresses[i].map((chainInfo, chainIndex) => {
        const chainSupply = {
          chainId: chainInfo.chainId,
          address: chainInfo.address,
          totalSupply: (result.data?.[resultIndex]?.result ?? 0n) as bigint,
        };

        resultIndex++;

        return chainSupply;
      });

      const totalTvl = chainData.reduce(
        (acc, curr) => acc + curr.totalSupply,
        0n,
      );

      return {
        symbol,
        totalTvl,
        chainData,
      };
    });
  } catch (error: any) {
    console.error(error);
    return [];
  }
}
