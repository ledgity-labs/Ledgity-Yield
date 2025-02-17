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
    marketTitle: "Arbitrum",
    chainId: ChainId.arbitrum_one,
    addresses: ADDRESSES[ChainId.arbitrum_one],
  },
  [ChainId.linea]: {
    marketTitle: "Arbitrum",
    chainId: ChainId.arbitrum_one,
    addresses: ADDRESSES[ChainId.arbitrum_one],
  },
  // [ChainId.hardhat]: {
  //   marketTitle: "Hardhat",
  //   chainId: ChainId.hardhat,
  //   addresses: ADDRESSES[ChainId.hardhat],
  // },
};
