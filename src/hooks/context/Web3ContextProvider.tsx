import {
  ReactElement,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
// Hooks
import { useLocalStorage } from "../utils/useLocalStorage";
import { useAccount, useBalance, usePublicClient, useSwitchChain } from "wagmi";
// Functions
import {
  NetworkConfig,
  getDefaultChainId,
  getNetworkConfig,
} from "@/functions/marketsAndNetworksConfig";
// Types
import { Address, PublicClient } from "viem";
import { ERC20TokenType, TokenInfo } from "@/types";

export type Web3ContextData = {
  // Wallet
  isConnected: boolean;
  currentAccount: Address | undefined;
  balance: bigint | undefined;
  isOpenConnectModal: boolean;
  setIsOpenConnectModal: (isOpen: boolean) => void;
  // Network
  appChainId: number;
  walletChainId: number | undefined;
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
  const lowercaseAddress = address?.toLowerCase() as Address;
  const { switchChainAsync } = useSwitchChain();
  const provider = usePublicClient();
  const { data: balance } = useBalance({
    address,
  });

  // Local state
  const [isOpenConnectModal, setIsOpenConnectModal] = useState(false);
  const [isChangingNetwork, setIsChangingNetwork] = useState(false);
  const [lastWalletChainId, setLastWalletChainId] = useState<
    number | undefined
  >();

  // Testnet display handling
  const { localData: displayTestnets, setLocalData: setDisplayTestnets } =
    useLocalStorage<boolean>("displayTesnets", false);

  function handleSetDisplayTestnets(value: boolean) {
    setDisplayTestnets(value);
  }

  // Network handling
  const { localData: storedChainId, setLocalData: setStoredChainId } =
    useLocalStorage<string>("chainId", String(getDefaultChainId()));
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
        isConnected,
        currentAccount: lowercaseAddress ?? undefined,
        balance: balance?.value,
        isOpenConnectModal,
        setIsOpenConnectModal,
        // Network
        appChainId,
        walletChainId: chain?.id,
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
