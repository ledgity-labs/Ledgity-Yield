import { deployments } from "../data/deployments";
import { dependencies } from "../data/dependencies";

export const getContractAddress = (
  contractName: string,
  chainId: number | string,
): `0x${string}` | undefined => {
  // Cast to string
  const chainIdString = chainId.toString();

  const addressFromDependencies = dependencies?.[contractName]?.[chainIdString];
  const addressFromDeployments =
    deployments?.[chainIdString]?.[0]?.contracts?.[contractName]?.address;

  return addressFromDependencies ?? addressFromDeployments;
};
