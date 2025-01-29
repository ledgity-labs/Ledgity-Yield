import dependenciesJSON from "../../contracts/dependencies.json";

type DependenciesIndex = {
  [contractName: string]: {
    [chainId: string]: `0x${string}`;
  };
};

export const dependencies = dependenciesJSON as DependenciesIndex;
