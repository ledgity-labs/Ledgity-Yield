import { deployments } from "../data/deployments";
import { dependencies } from "../data/dependencies";

import { usePublicClient } from "wagmi";
import { useCurrentChain } from "./useCurrentChain";

export const useAvailableLTokens = () => {
  // Return empty results if the frontend is not connected to any chain
  const currentChain = useCurrentChain();
  if (!currentChain) return [];

  // Return empty results if no contracts have been deployed on the current chain
  if (!Object.keys(deployments).includes(currentChain.id.toString())) return [];

  // Else, get contracts deployed on the current chain
  const contracts =
    deployments[currentChain.id.toString() as keyof typeof deployments][0]
      .contracts;

  // Retrieve L-Tokens contracts (ones that are prefixed with "L" + the name of a dependency)
  let lTokensNames: string[] = [];
  Object.keys(contracts).forEach((contractName: string) => {
    if (
      Object.keys(dependencies).some((suffix) => contractName === "L" + suffix)
    ) {
      lTokensNames.push(contractName);
    }
  });

  return lTokensNames;
};
