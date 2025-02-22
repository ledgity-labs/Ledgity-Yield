import { useWeb3Context } from "./context/Web3ContextProvider";
import { getContractAddress } from "@/lib/getContractAddress";

export const useContractAddress = (
  contractName: string,
): `0x${string}` | undefined => {
  const { appChainId } = useWeb3Context();
  return getContractAddress(contractName, appChainId);
};
