import { ChainId } from "./chainId";
import { zeroAddress, Address } from "viem";
import {
  globalBlacklistAddress,
  globalOwnerAddress,
  globalPauseAddress,
  ldyStakingAddress,
  lTokenSignalerAddress,
} from "@/types";
import { dependencies } from "../../contracts/dependencies";

// @dev Reexport to have all addresses in one place
export { dependencies as dependenciesAddresses };

export type ContractName =
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
export const lTokenAddresses: {
  [chainId: number]: {
    LEURC?: Address;
    LUSDC?: Address;
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
): {
  [key in ContractName]: Address;
} {
  // Check that LTokens always have their underlying token address specified
  if (
    (lTokenAddresses[chainId]?.LEURC && !dependencies[chainId]?.EURC) ||
    (lTokenAddresses[chainId]?.LUSDC && !dependencies[chainId]?.USDC)
  )
    throw Error("LToken address specified without dependency address");

  // @dev The as const of the addresses is annoying for generic functions
  return {
    GlobalBlacklist: globalBlacklistAddress[chainId] || zeroAddress,
    GlobalOwner: globalOwnerAddress[chainId] || zeroAddress,
    GlobalPause: globalPauseAddress[chainId] || zeroAddress,
    LDYStaking: ldyStakingAddress[chainId] || zeroAddress,
    LTokenSignaler: (lTokenSignalerAddress as any)[chainId] || zeroAddress,
    // Tokens
    LEURC: lTokenAddresses[chainId]?.LEURC || zeroAddress,
    LUSDC: lTokenAddresses[chainId]?.LUSDC || zeroAddress,
    LDY: dependencies[chainId]?.LDY || zeroAddress,
    EURC: dependencies[chainId]?.EURC || zeroAddress,
    USDC: dependencies[chainId]?.USDC || zeroAddress,
  };
}

const addressesProd: {
  [chainId: number]: {
    [key in ContractName]: Address;
  };
} = {
  [ChainId.mainnet]: fetchChainAddresses(ChainId.mainnet),
  [ChainId.arbitrum_one]: fetchChainAddresses(ChainId.arbitrum_one),
  [ChainId.base]: fetchChainAddresses(ChainId.base),
  [ChainId.linea]: fetchChainAddresses(ChainId.linea),
};

export const ADDRESSES = addressesProd;
