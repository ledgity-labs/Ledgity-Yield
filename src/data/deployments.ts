import deploymentsJSON from "../../contracts/deployments.json";

type EthereumAbiInput = {
  indexed?: boolean;
  internalType: string;
  name: string;
  type: string;
};

type EthereumAbiOutput = {
  internalType: string;
  name: string;
  type: string;
};

type EthereumAbiItem = {
  anonymous?: boolean;
  inputs?: EthereumAbiInput[];
  outputs?: EthereumAbiOutput[];
  name?: string;
  type: string;
  stateMutability?: string;
};

type ContractEntry = {
  address: `0x${string}`;
  abi: EthereumAbiItem[];
};

type NetworkConfig = {
  name: string;
  chainId: string;
  contracts: {
    [contractName: string]: ContractEntry;
  };
};

type DeploymentIndex = {
  [chainId: string]: NetworkConfig[];
};

export const deployments = deploymentsJSON as DeploymentIndex;
