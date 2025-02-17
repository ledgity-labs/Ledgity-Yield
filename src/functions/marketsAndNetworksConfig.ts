import { ChainId, ChainIdToNetwork } from "../data/chainId";
import { Chain } from "@wagmi/core/chains";
import { MarketConfig, marketConfigsIndex } from "../data/marketsConfig";
import {
  BaseNetworkConfig,
  ExplorerLinkBuilderConfig,
  ExplorerLinkBuilderProps,
  NetworkConfig,
  networkConfigsIndex,
} from "../data/networksConfig";

/**
 * Generates network configs based on networkConfigs & fork settings.
 * Forks will have a rpcOnly clone of their underlying base network config.
 */
export const networkConfigs = Object.keys(networkConfigsIndex).reduce(
  (acc, value) => {
    acc[value] = networkConfigsIndex[value];
    return acc;
  },
  {} as { [key: string]: BaseNetworkConfig },
);

/**
 * Fetches network configs based on networkConfigs & fork settings.
 */
export function getNetworkConfigs(): BaseNetworkConfig[] {
  return Object.values(networkConfigs)
    .reduce((acc: BaseNetworkConfig[], networkConfig) => {
      acc.push(networkConfig);

      return acc;
    }, [])
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function getWagmiNetworkConfigs() {
  return getNetworkConfigs().map((networkConfig) => {
    const {
      chainId,
      name,
      baseAssetName,
      baseAssetSymbol,
      baseAssetDecimals,
      publicJsonRPCUrl,
      explorerName,
      explorerLink,
      isTestnet,
    } = networkConfig;

    return {
      id: chainId,
      name,
      nativeCurrency: {
        name: baseAssetName,
        symbol: baseAssetSymbol,
        decimals: baseAssetDecimals,
      },
      rpcUrls: {
        default: {
          http: publicJsonRPCUrl,
        },
      },
      blockExplorers: {
        default: { name: explorerName, url: explorerLink },
      },
      testnet: isTestnet,
    } satisfies Chain;
  }) as unknown as readonly [Chain, ...Chain[]];
}

export function getDefaultChainId() {
  return Number(Object.keys(marketConfigsIndex)[0]);
}

export function getSupportedChainIds(): number[] {
  return Object.values(marketConfigsIndex).map((config) => config.chainId);
}

export function chainIdToMarketConfig(
  chainId: number | undefined,
): MarketConfig | undefined {
  if (chainId === undefined) return;
  return marketConfigsIndex[chainId];
}

function linkBuilder({
  baseUrl,
  addressPrefix = "address",
  txPrefix = "tx",
}: ExplorerLinkBuilderConfig): (props: ExplorerLinkBuilderProps) => string {
  return ({ tx, address }: ExplorerLinkBuilderProps): string => {
    if (tx) {
      return `${baseUrl}/${txPrefix}/${tx}`;
    }
    if (address) {
      return `${baseUrl}/${addressPrefix}/${address}`;
    }
    return baseUrl;
  };
}

function blockCalculator(blockTime: number) {
  return (secs: number): number => {
    const secsToMs = secs * 1000;
    if (blockTime === 0 || secsToMs < blockTime) return 1;
    return Math.ceil(secsToMs / blockTime);
  };
}

export function getNetworkConfig(chainId: ChainId | undefined): NetworkConfig {
  // usedapp 'blocks' unconfigured chains
  if (!chainId) {
    return {
      name: "Unsupported chain",
      isCompatibleNetwork: false,
      secondsToBlocks: (secs: number) => undefined,
    } as unknown as NetworkConfig;
  }

  const config = networkConfigs[chainId];
  if (!config) {
    // this case can only ever occure when a wallet is connected with a unknown chainId which will not allow interaction
    const name = ChainIdToNetwork[chainId]
      ? `${ChainIdToNetwork[chainId][0].toUpperCase()}${ChainIdToNetwork[
          chainId
        ].slice(1)}`
      : undefined;
    return {
      name: name || `Unknown chainId: ${chainId}`,
      isCompatibleNetwork: false,
      secondsToBlocks: (secs: number) => undefined,
    } as unknown as NetworkConfig;
  }
  return {
    ...config,
    explorerLinkBuilder: linkBuilder({ baseUrl: config.explorerLink }),
    secondsToBlocks: blockCalculator(config.blockTime),
  };
}

// reexport so we can forbid config import
export type { MarketConfig, NetworkConfig, ChainId };
