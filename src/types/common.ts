export type TokenInfo = {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
};

export type LTokenInfo = TokenInfo & {
  apr: number;
  totalSupply: bigint;
  balance: bigint;
};
