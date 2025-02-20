import {
  useAccount,
  useBalance,
  useConnect,
  useDisconnect,
  useSwitchChain,
  usePublicClient,
} from "wagmi";
import { useLocalStorage } from "../utils/useLocalStorage";
import { mainnet, arbitrum } from "wagmi/chains";
import { PublicClient } from "viem";
import React, {
  ReactElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  NetworkConfig,
  getNetworkConfig,
  getDefaultChainId,
} from "../../functions/marketsAndNetworksConfig";
import { ERC20TokenType, TokenInfo } from "../../types";
import { Address } from "viem";

export type Web3ContextData = {
  // Wallet
  loading: boolean;
  isConnected: boolean;
  connectWallet: (type?: string) => Promise<void>;
  disconnectWallet: () => void;
  currentAccount: string;
  balance: bigint | undefined;
  connectorType: string | undefined;
  isOpenConnectModal: boolean;
  setIsOpenConnectModal: (isOpen: boolean) => void;
  // Network
  appChainId: number;
  walletChainId: number | undefined;
  chainId: number;
  isChangingNetwork: boolean;
  displayTestnets: boolean;
  handleSwitchNetwork: (newChainId: number) => Promise<void>;
  currentNetworkConfig: NetworkConfig;
  handleSetDisplayTestnets: (value: boolean) => void;
  provider: PublicClient | undefined;
  baseAssetData: TokenInfo;
  wrappedBaseAssetData: TokenInfo;
  // Functions
  addERC20Token: (token: ERC20TokenType) => Promise<boolean>;
};

const Web3Context = createContext({} as Web3ContextData);

export function Web3ContextProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  // Wagmi hooks
  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const provider = usePublicClient();
  const { data: balance } = useBalance({
    address,
  });

  // Local state
  const [loading, setLoading] = useState(false);
  const [isOpenConnectModal, setIsOpenConnectModal] = useState(false);
  const [connectorType, setConnectorType] = useState<string | undefined>();
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const [lastWalletChainId, setLastWalletChainId] = useState<
    number | undefined
  >();

  // Disconnect wallet handler
  const disconnectWallet = useCallback(async () => {
    console.log("=x==== DISCONNECT WALLET ====x=");
    await disconnectAsync();
    setLoading(false);
    setConnectorType(undefined);
  }, [disconnectAsync]);

  // Connect wallet handler
  const connectWallet = useCallback(
    async (type?: string) => {
      setLoading(true);
      console.log("=o==== CONNECT WALLET ====o=");
      try {
        const connector = type
          ? connectors.find((c) => c.id === type)
          : connectors.find((c) => c.id === "injected");

        if (connector) {
          await connectAsync({ connector });
          setConnectorType(connector.id);
        }
      } catch (e: any) {
        console.log("=!=== error on activation ===!=", e);
        setConnectorType(undefined);
      }
      setLoading(false);
    },
    [connectAsync, connectors, disconnectWallet],
  );

  // Testnet display handling
  const [displayTestnets, setDisplayTestnets] = useLocalStorage<boolean>(
    "displayTesnets",
    false,
  );

  function handleSetDisplayTestnets(value: boolean) {
    setDisplayTestnets(value);
  }

  // Network handling
  const [storedChainId, setStoredChainId] = useLocalStorage<string>(
    "chainId",
    String(getDefaultChainId()),
  );
  const [appChainId, setAppChainId] = useState<number>(() => {
    if (isConnected && chain?.id) return chain.id;
    return storedChainId ? parseInt(storedChainId) : getDefaultChainId();
  });

  // Handle wallet chain changes
  useEffect(() => {
    if (!chain?.id || !isConnected) return;

    if (!lastWalletChainId) {
      setLastWalletChainId(chain.id);
    } else if (chain.id !== lastWalletChainId) {
      setLastWalletChainId(chain.id);
      handleSwitchNetwork(chain.id);
    }
  }, [chain?.id, isConnected]);

  // Handle network switching
  async function handleSwitchNetwork(newChainId: number) {
    try {
      if (newChainId === appChainId && newChainId === chain?.id) return;

      setIsChangingNetwork(true);

      if (isConnected && switchChainAsync) {
        try {
          await switchChainAsync({ chainId: newChainId });
        } catch (err: any) {
          if (err.code !== 4001) {
            // Handle adding network if not available
            await addNetworkToWallet(newChainId).catch((err) => {
              console.error("Error adding network to wallet:", err);
            });
          } else {
            throw Error(err.message);
          }
        }

        // Handle WalletConnect reconnection if needed
        if (connectorType?.includes("walletConnect")) {
          let walletConnectType = "";

          if (newChainId === mainnet.id) walletConnectType = "walletConnect";
          if (newChainId === arbitrum.id) walletConnectType = "walletConnect";

          if (!walletConnectType) {
            console.warn(
              "WalletConnect type not found for chainId:",
              newChainId,
            );
          } else {
            await connectWallet(walletConnectType);
          }
        }
      }

      // Update local storage and app state
      setStoredChainId(String(newChainId));
      setAppChainId(newChainId);
    } catch (err: any) {
      console.error("Error switching network:", err.message);
    }

    setIsChangingNetwork(false);
  }

  // Add network to wallet
  async function addNetworkToWallet(newChainId: number): Promise<boolean> {
    if (!window.ethereum) return false;

    const networkInfo = getNetworkConfig(newChainId);
    const params = {
      chainId: `0x${newChainId.toString(16)}`,
      chainName: networkInfo.name,
      nativeCurrency: {
        name: networkInfo.baseAssetName,
        symbol: networkInfo.baseAssetSymbol,
        decimals: networkInfo.baseAssetDecimals,
      },
      rpcUrls: [
        ...networkInfo.publicJsonRPCUrl,
        networkInfo.publicJsonRPCWSUrl,
      ].filter(Boolean),
      blockExplorerUrls: [networkInfo.explorerLink],
      iconUrls: networkInfo.publicLogoPath
        ? [networkInfo.publicLogoPath]
        : undefined,
    };

    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [params],
      });
      return true;
    } catch (error) {
      console.error("Error adding network:", error);
      return false;
    }
  }

  // Add ERC20 token to wallet
  const addERC20Token = async ({
    address,
    symbol,
    decimals,
    image,
  }: ERC20TokenType): Promise<boolean> => {
    if (!window.ethereum || !address) return false;

    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address,
            symbol,
            decimals,
            image,
          },
        },
      });
      return true;
    } catch (error) {
      console.error("Error adding token:", error);
      return false;
    }
  };

  const currentNetworkConfig = getNetworkConfig(appChainId);

  // Network config data
  const baseAssetData = {
    decimals: currentNetworkConfig?.baseAssetDecimals,
    name: currentNetworkConfig?.baseAssetName,
    symbol: currentNetworkConfig?.baseAssetSymbol,
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address,
  };

  const wrappedBaseAssetData = {
    decimals: currentNetworkConfig?.baseAssetDecimals,
    name: currentNetworkConfig?.baseAssetName,
    symbol: currentNetworkConfig?.baseAssetSymbol,
    address: currentNetworkConfig?.wrappedBaseAssetAddress as Address,
  };

  return (
    <Web3Context.Provider
      value={{
        // Wallet
        loading,
        isConnected,
        connectWallet,
        disconnectWallet,
        currentAccount: address?.toLowerCase() || "",
        balance: balance?.value,
        connectorType,
        isOpenConnectModal,
        setIsOpenConnectModal,
        // Network
        appChainId,
        walletChainId: chain?.id,
        chainId: appChainId,
        isChangingNetwork,
        displayTestnets,
        handleSwitchNetwork,
        currentNetworkConfig,
        handleSetDisplayTestnets,
        provider,
        baseAssetData,
        wrappedBaseAssetData,
        // Functions
        addERC20Token,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3Context = () => useContext(Web3Context);
