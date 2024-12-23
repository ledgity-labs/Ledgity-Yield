import {
  mainnet,
  hardhat,
  arbitrum,
  arbitrumGoerli,
  lineaTestnet,
  linea,
  Chain,
  baseSepolia,
  sepolia,
} from "@wagmi/core/chains";

// Build chain icons map
export const chainsIcons = {
  1: "/assets/chains/ethereum-mainnet.svg",
  31337: "/assets/chains/hardhat.svg",
  421613: "/assets/chains/arbitrum-goerli.png",
  42161: "/assets/chains/arbitrum.svg",
  59140: "/assets/chains/linea-goerli.png",
  59144: "/assets/chains/linea.png",
  195: "/assets/chains/okxlogo.png",
  196: "/assets/chains/okxlogo.png",
  8453: "/assets/chains/base.png",
  84532: "/assets/chains/base.png",
  11155111: "/assets/chains/ethereum-sepolia.png",
} as { [key: number]: string };

const xlayerTestnet: Chain = {
  id: 195,
  name: "OKX Layer Testnet",
  nativeCurrency: {
    name: "Testnet OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testrpc.x1.tech"],
    },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/x1-test" },
  },
  testnet: true,
};

const xlayerMainnet: Chain = {
  id: 196,
  name: "OKX Layer",
  nativeCurrency: {
    name: "Mainnet OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.xlayer.tech"],
    },
  },
  blockExplorers: {
    default: { name: "OKLink", url: "https://www.oklink.com/xlayer" },
  },
  testnet: false,
};

const base: Chain = {
  id: 8453,
  name: "Base",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://base-rpc.publicnode.com"],
    },
  },
  blockExplorers: {
    default: { name: "BaseScan", url: "https://basescan.org/" },
  },
  testnet: false,
};

const ethereum: Chain = {
  id: 1,
  name: "Ethereum",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://eth.llamarpc.com"],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io/" },
  },
  testnet: false,
};

/// Figure whether we're in dev or prod environment
const chainsEnv = process.env.NEXT_PUBLIC_VERCEL_ENV === "dev" ? "dev" : "prod";

// Build chain lists for each environment, and export chains for the current one
const prodChains: readonly [Chain, ...Chain[]] = [
  ethereum,
  arbitrum,
  base,
  linea,
  // xlayerMainnet,
];
const devChains: readonly [Chain, ...Chain[]] = [
  ...prodChains,
  sepolia,
  hardhat,
  xlayerTestnet,
  lineaTestnet,
  // baseSepolia,
];
export const chains: readonly [Chain, ...Chain[]] =
  chainsEnv === "prod" ? prodChains : devChains;
