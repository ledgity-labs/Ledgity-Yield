import { ChainId } from "./chainId";
import { zeroAddress } from "viem";
import {
  globalBlacklistAddress,
  globalOwnerAddress,
  globalPauseAddress,
  ldyAddress,
  ldyStakingAddress,
  lTokenSignalerAddress,
} from "@/types";
import { dependencies } from "../../contracts/dependencies";

type ContractName =
  | "GlobalBlacklist"
  | "GlobalOwner"
  | "GlobalPause"
  | "LDY"
  | "LDYStaking"
  | "LTokenSignaler"
  // Tokens
  | "EURC"
  | "USDC"
  | "LEURC"
  | "LUSDC";

// @dev New LTokens should be specified here to feed the wagmi hooks
const tokenAddresses: {
  [chainId: number]: {
    LEURC?: string;
    LUSDC?: string;
  };
} = {
  [ChainId.mainnet]: {},
  [ChainId.arbitrum_one]: {
    LUSDC: "0xd54d564606611A3502FE8909bBD3075dbeb77813",
  },
  [ChainId.base]: {
    LEURC: "0x77ce973744745310359B0d1a3415A34FF983708F",
    LUSDC: "0x3C769d0e8D21d380228dFB7918c6933bb6ecB6D4",
  },
  [ChainId.linea]: {
    LUSDC: "0x4AF215DbE27fc030F37f73109B85F421FAB45B7a",
  },
};

function fetchChainAddresses(
  chainId:
    | ChainId.mainnet
    | ChainId.arbitrum_one
    | ChainId.base
    | ChainId.linea,
) {
  // @dev The as const of the addresses is annoying for generic functions
  return {
    GlobalBlacklist: globalBlacklistAddress[chainId] || zeroAddress,
    GlobalOwner: globalOwnerAddress[chainId] || zeroAddress,
    GlobalPause: globalPauseAddress[chainId] || zeroAddress,
    LDYStaking: ldyStakingAddress[chainId] || zeroAddress,
    LTokenSignaler: (lTokenSignalerAddress as any)[chainId] || zeroAddress,
    // Tokens
    LDY: (ldyAddress as any)[chainId] || zeroAddress,
    LEURC: tokenAddresses[chainId]?.LEURC || zeroAddress,
    LUSDC: tokenAddresses[chainId]?.LUSDC || zeroAddress,
    EURC: dependencies[chainId]?.EURC || zeroAddress,
    USDC: dependencies[chainId]?.USDC || zeroAddress,
  };
}

const addressesProd: {
  [chainId: string]: {
    [key in ContractName]: string;
  };
} = {
  mainnet: fetchChainAddresses(ChainId.mainnet),
  arbitrum_one: fetchChainAddresses(ChainId.arbitrum_one),
  base: fetchChainAddresses(ChainId.base),
  linea: fetchChainAddresses(ChainId.linea),
};

export const ADDRESSES = addressesProd;
