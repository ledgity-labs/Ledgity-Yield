import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { useReadContracts } from "wagmi";
import { useEffect, useState } from "react";
//
import { Address } from "viem";
import { genericErc20Abi } from "@/types";

type AllowanceData = {
  amount: bigint;
  address: string;
};

export function useAllowances(
  tokenAddresses: (Address | undefined)[] | undefined,
  owner: Address | undefined,
  spender: Address | undefined,
): { allowances: AllowanceData[]; lastUpdate: number } {
  try {
    const { appChainId } = useWeb3Context();
    const [currentValue, setCurrentValue] = useState<{
      allowances: AllowanceData[];
      lastUpdate: number;
    }>({ allowances: [], lastUpdate: 0 });

    const tokensFiltered = [...new Set(tokenAddresses)].filter(
      (address) =>
        address && address !== "0x0000000000000000000000000000000000000000",
    );

    const conditionsOk = !!owner && !!spender && tokensFiltered.length > 0;

    const calls = tokensFiltered?.map(
      (address) =>
        ({
          address,
          abi: genericErc20Abi,
          chainId: appChainId,
          functionName: "allowance",
          args: [owner, spender],
        }) as const,
    );

    const { data, error } = useReadContracts({
      contracts: conditionsOk ? calls : [],
      query: {
        refetchInterval: 5 * 1000,
      },
    });

    useEffect(() => {
      if (error || !data) {
        return;
      }

      const now = Date.now();
      const allowances = data.map((el, i) => ({
        amount: (el?.result || 0n) as bigint,
        address: tokensFiltered[i] as Address,
      }));

      // Only update state if allowances have changed
      if (
        allowances.length &&
        JSON.stringify(allowances) !== JSON.stringify(currentValue.allowances)
      ) {
        setCurrentValue({ allowances, lastUpdate: now });
      } else if (now !== currentValue.lastUpdate) {
        setCurrentValue({ ...currentValue, lastUpdate: now });
      }
    }, [data, error, currentValue, tokensFiltered, owner, spender]);

    useEffect(() => {
      setCurrentValue({
        allowances: [],
        lastUpdate: 0,
      });
    }, [appChainId]);

    return currentValue;
  } catch (err) {
    console.error("useAllowances", err);
    return { allowances: [], lastUpdate: 0 };
  }
}
