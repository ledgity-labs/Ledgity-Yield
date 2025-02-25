import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import { ADDRESSES } from "@/data/addresses";

export function getContractAddress(
  contractName: string,
): `0x${string}` | undefined {
  const { appChainId } = useWeb3Context();

  return (ADDRESSES as any)[appChainId]?.[contractName as string];
}
