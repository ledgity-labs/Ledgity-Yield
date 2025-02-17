import { ChainId } from "./chainId";

export type ExplorerLinkBuilderProps = {
  tx?: string;
  address?: string;
};

export type ExplorerLinkBuilderConfig = {
  baseUrl: string;
  addressPrefix?: string;
  txPrefix?: string;
};

export type NetworkConfig = {
  order?: number;
  name: string;
  chainId: ChainId;
  publicJsonRPCUrl: readonly string[];
  publicJsonRPCWSUrl: string;
  baseAssetName: string;
  baseAssetSymbol: string;
  baseAssetDecimals: number;
  wrappedBaseAssetSymbol: string;
  wrappedBaseAssetAddress: string;
  blockTime: number; // in milliseconds
  explorerName: string;
  explorerLink: string;
  explorerLinkBuilder?: (props: ExplorerLinkBuilderProps) => string;
  secondsToBlocks: (blockTime: number) => number;
  isCompatibleNetwork: boolean;
  isImplemented?: boolean;
  isTestnet?: boolean;
  isForked?: boolean;
  isAppChain?: boolean;
  logoPath: string;
  ensCompatible?: boolean;
  publicLogoPath?: string;
};

export type BaseNetworkConfig = Omit<
  NetworkConfig,
  "explorerLinkBuilder" | "secondsToBlocks"
>;

export const networkConfigsIndex: { [chain: string]: BaseNetworkConfig } = {
  [ChainId.mainnet]: {
    order: 1,
    name: "Ethereum",
    chainId: ChainId.mainnet,
    publicJsonRPCUrl: ["https://cloudflare-eth.com/v1/mainnet"],
    publicJsonRPCWSUrl: "wss://eth-mainnet.alchemyapi.io/v2/demo",
    baseAssetName: "Ether",
    baseAssetSymbol: "ETH",
    baseAssetDecimals: 18,
    wrappedBaseAssetSymbol: "WETH",
    wrappedBaseAssetAddress: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    blockTime: 12000,
    explorerName: "Etherscan",
    explorerLink: "https://etherscan.io",
    logoPath: "assets/img/networks/ethereum.svg",
    isCompatibleNetwork: true,
    ensCompatible: true,
  },
  [ChainId.base]: {
    order: 2,
    name: "Base",
    chainId: ChainId.base,
    publicJsonRPCUrl: ["https://base.publicnode.com"],
    publicJsonRPCWSUrl: "wss://base.publicnode.com",
    baseAssetName: "Ethereum",
    baseAssetDecimals: 18,
    baseAssetSymbol: "ETH",
    wrappedBaseAssetSymbol: "WETH",
    wrappedBaseAssetAddress: "0x4200000000000000000000000000000000000006",
    blockTime: 2000,
    explorerName: "BaseScan",
    explorerLink: "https://basescan.org",
    logoPath: "assets/img/networks/base.svg",
    isCompatibleNetwork: true,
    ensCompatible: false,
  },
  [ChainId.arbitrum_one]: {
    order: 3,
    name: "Arbitrum",
    chainId: ChainId.arbitrum_one,
    publicJsonRPCUrl: [
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum-one.publicnode.com",
    ],
    publicJsonRPCWSUrl: "wss://arbitrum-one.publicnode.com",
    baseAssetName: "Ether",
    baseAssetSymbol: "ETH",
    baseAssetDecimals: 18,
    wrappedBaseAssetSymbol: "WETH",
    wrappedBaseAssetAddress: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    blockTime: 260,
    explorerName: "Arbiscan",
    explorerLink: "https://arbiscan.io",
    logoPath: "assets/img/networks/arbitrum.svg",
    isCompatibleNetwork: true,
    ensCompatible: false,
  },
  [ChainId.linea]: {
    order: 4,
    name: "Linea",
    chainId: ChainId.linea,
    publicJsonRPCUrl: ["https://rpc.linea.build", "https://linea.drpc.org"],
    publicJsonRPCWSUrl: "wss://linea-rpc.publicnode.com",
    baseAssetName: "Ethereum",
    baseAssetDecimals: 18,
    baseAssetSymbol: "ETH",
    wrappedBaseAssetSymbol: "WETH",
    wrappedBaseAssetAddress: "0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f",
    blockTime: 2100,
    explorerName: "LineaScan",
    explorerLink: "https://lineascan.build",
    logoPath: "assets/img/networks/polygon.svg",
    isCompatibleNetwork: true,
    ensCompatible: false,
  },
};
