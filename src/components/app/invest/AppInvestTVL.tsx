import { Amount, Card, Spinner } from "@/components/ui";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { FC, useEffect, useState } from "react";
import { getContractAddress } from "@/lib/getContractAddress";
import { lTokenAbi } from "@/generated";
import { formatUnits, parseUnits } from "viem";
import { watchBlockNumber, readContracts } from "@wagmi/core";
import { wagmiConfig } from "../../../config/wagmi";
import { useCurrentChain } from "@/hooks/useCurrentChain";
// Functions
import { fetchTokenPriceUsd } from "../../../functions/fetchTokenPriceUsd";

const availableChains = [42161, 59144];

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const AppInvestTVL: FC<Props> = (props) => {
  const [readsConfig, setReadsConfig] = useState<
    Parameters<typeof readContracts>[1]["contracts"]
  >([]);
  const [tvlUsd, setTvlUsd] = useState(0n);
  const lTokens = useAvailableLTokens();
  const [isLoading, setIsLoading] = useState(false);
  const currentChain = useCurrentChain();

  // This function retrieve symbol, total supply and decimals of each lToken
  const populateReadsConfig = () => {
    //
    const newReadsConfig = [] as {
      address: `0x${string}`;
      abi: any;
      functionName: string;
      chainId: number;
    }[];

    // Push read calls for total supply and decimals of each lToken
    for (const chainId of availableChains) {
      for (const lTokenSymbol of lTokens) {
        const lTokenAddress = getContractAddress(lTokenSymbol, chainId);

        if (!lTokenAddress) {
          // console.warn(
          //   `Address for ${lTokenSymbol} not found on chain ${chainId}`,
          // );
          continue;
        }

        // Populate required reads requests
        ["symbol", "totalSupply", "decimals"].forEach((functionName) => {
          newReadsConfig.push({
            address: lTokenAddress,
            abi: lTokenAbi,
            functionName: functionName,
            chainId: chainId,
          });
        });
      }
    }

    if (JSON.stringify(newReadsConfig) !== JSON.stringify(readsConfig)) {
      setIsLoading(true);
      setReadsConfig(newReadsConfig);
    }
  };

  useEffect(populateReadsConfig, [readsConfig]);

  useEffect(
    () =>
      watchBlockNumber(wagmiConfig, {
        async onBlockNumber() {
          if (!currentChain) return;

          const data = await readContracts(wagmiConfig, {
            contracts: readsConfig,
          });

          if (data.length > 0) {
            let newTvlUsd = 0n;
            while (data.length !== 0) {
              // Extract data
              const lTokenSymbol = data.shift()!.result! as string;
              const lTokenTotalSupply = data.shift()!.result! as bigint;
              const lTokenDecimals = data.shift()!.result! as number;
              const underlyingSymbol = lTokenSymbol.slice(1);

              // Skip, if data is not available
              if (!lTokenTotalSupply || !lTokenDecimals) continue;

              // Retrieve underlying token USD rate
              const usdRate = await fetchTokenPriceUsd(underlyingSymbol).then(
                (rate) => rate.toString(),
              );

              newTvlUsd +=
                (lTokenTotalSupply * parseUnits(usdRate, lTokenDecimals)) /
                parseUnits("1", lTokenDecimals);
            }

            if (tvlUsd.toString() !== newTvlUsd.toString())
              setTvlUsd(newTvlUsd);
          }
          setIsLoading(false);
        },
      }),
    [readsConfig],
  );

  return (
    <div {...props}>
      {/* {(isLoading && <Spinner />) || <Amount prefix="$" value={tvlUsd} decimals={6} />} */}
      {(isLoading && <Spinner />) ||
        "$" + Number(formatUnits(tvlUsd, 6)).toLocaleString()}
    </div>
  );
};
