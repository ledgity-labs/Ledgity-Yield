import { ChainId } from "./chainId";
import { ContractName, ADDRESSES } from "./addresses";

export type MarketConfig = {
  marketTitle: string;
  chainId: ChainId;
  addresses: { [key in ContractName]?: string };
};

export const marketConfigsIndex: {
  [chainId: string]: MarketConfig;
} = {
  [ChainId.mainnet]: {
    marketTitle: "Ethereum",
    chainId: ChainId.mainnet,
    addresses: ADDRESSES[ChainId.mainnet],
  },
  [ChainId.arbitrum_one]: {
    marketTitle: "Arbitrum",
    chainId: ChainId.arbitrum_one,
    addresses: ADDRESSES[ChainId.arbitrum_one],
  },
  [ChainId.base]: {
    marketTitle: "Base",
    chainId: ChainId.base,
    addresses: ADDRESSES[ChainId.base],
  },
  [ChainId.linea]: {
    marketTitle: "Linea",
    chainId: ChainId.linea,
    addresses: ADDRESSES[ChainId.linea],
  },
  // [ChainId.hardhat]: {
  //   marketTitle: "Hardhat",
  //   chainId: ChainId.hardhat,
  //   addresses: ADDRESSES[ChainId.hardhat],
  // },
};
