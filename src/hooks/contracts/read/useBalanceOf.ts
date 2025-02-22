import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { useReadGenericErc20BalanceOf } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useBlockNumber } from "wagmi";
import { Address, zeroAddress } from "viem";

export function useBalanceOf(
  address: Address,
  account: Address | undefined,
): bigint {
  const { appChainId } = useWeb3Context();
  const queryClient = useQueryClient();

  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data, queryKey } = useReadGenericErc20BalanceOf({
    address: address,
    args: [account || zeroAddress],
  });

  useEffect(() => {
    if (blockNumber && blockNumber % 2n === 0n)
      queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient, account, appChainId]);

  return data || 0n;
}
