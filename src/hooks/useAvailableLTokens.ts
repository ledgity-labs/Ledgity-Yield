import { useWeb3Context } from "./context/Web3ContextProvider";
import { lTokenAddresses } from "@/data/addresses";

export function useAvailableLTokens(): string[] {
  const { appChainId } = useWeb3Context();
  return Object.keys(lTokenAddresses[appChainId] || {});
}
