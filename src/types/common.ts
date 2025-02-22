import { Address } from "viem";

export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  address: Address;
};

export type LTokenInfo = TokenInfo & {
  chainId: number;
  apr: number;
  totalSupply: bigint;
  balance: bigint;
};

export type ERC20TokenType = {
  address: Address;
  symbol: string;
  decimals: number;
  image?: string;
};
