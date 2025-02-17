import { ChainId } from "./chainId";
import { deployments } from "./deployments";

const contractNames = [
  "APRHistory",
  "GlobalBlacklist",
  "GlobalOwner",
  "GlobalPause",
  "LDYStaking",
  "LTokenSignaler",
  "LEURC",
  "LUSDC",
];

export type ContractName = (typeof contractNames)[number];

type AddressDirectory = {
  [chainId: string]: {
    [key in ContractName]: string;
  };
};

function fetchChainAddresses(chainId: number) {
  return contractNames.reduce(
    (acc, contractName) => {
      const address =
        deployments[chainId.toString()]?.[0]?.contracts?.[contractName]
          ?.address || "0x0000000000000000000000000000000000000000";

      acc[contractName] = address;

      return acc;
    },
    {} as { [key in ContractName]: string },
  );
}

const addressesProd: AddressDirectory = {
  mainnet: fetchChainAddresses(ChainId.mainnet),
  arbitrum_one: fetchChainAddresses(ChainId.arbitrum_one),
  base: fetchChainAddresses(ChainId.base),
  linea: fetchChainAddresses(ChainId.linea),
};

export const ADDRESSES = addressesProd;
