import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { useReadGenericErc20BalanceOf } from "@/types";
import { Address, zeroAddress } from "viem";

export function useBalanceOf(
  address: Address | undefined,
  account: Address | undefined,
): bigint {
  const { appChainId } = useWeb3Context();

  const { data } = useReadGenericErc20BalanceOf({
    chainId: appChainId,
    address,
    args: [account || zeroAddress],
    query: {
      refetchInterval: 5 * 1000,
    },
  });

  return data || 0n;
}
