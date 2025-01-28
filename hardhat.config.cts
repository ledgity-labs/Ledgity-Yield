// This file has a .cts extension, because Hardhat that's currently the only way to get
// hardhat to support ESM in TypeScript projects.
// See: https://hardhat.org/hardhat-runner/docs/advanced/using-esm
// And: https://github.com/NomicFoundation/hardhat/issues/3385

import "hardhat-contract-sizer";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-verify";
import "@okxweb3/hardhat-explorer-verify";
import "colors";

// Tasks
import "./contracts/hardhat/tasks/verify.cts";

import { parseEther } from "ethers/lib/utils";
import { type HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkUserConfig, NetworkUserConfig } from "hardhat/types";
import secrets from "./secrets.json";

const {
  DEPLOYER_PK,
  MAINNET_RPC_URL,
  MAINNET_FORKING_BLOCK,
  MAINNET_VERIFY_API_KEY,
  BASE_RPC_URL,
  BASE_FORKING_BLOCK,
  BASE_VERIFY_API_KEY,
  HARDHAT_FORK_TARGET,
  LINEASCAN_API_KEY,
  ARBISCAN_API_KEY,
  ETHERSCAN_API_KEY,
  OKXSCAN_API_KEY,
} = secrets;

// Validation
if (!DEPLOYER_PK) throw Error("Deployer private key not found in secrets.json");
if (!MAINNET_RPC_URL || !MAINNET_VERIFY_API_KEY)
  throw Error("Mainnet config not found in secrets.json");
if (!BASE_RPC_URL || !BASE_VERIFY_API_KEY)
  throw Error("Base config not found in secrets.json");

// Centralized network configuration
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  forkingBlock?: string;
  verifyApiKey: string;
  apiURL: string;
  browserURL: string;
  deploy?: string[];
  isTestnet?: boolean;
}

const networkConfigs: { [key: string]: NetworkConfig } = {
  mainnet: {
    name: "mainnet",
    chainId: 1,
    rpcUrl: MAINNET_RPC_URL,
    forkingBlock: MAINNET_FORKING_BLOCK,
    verifyApiKey: ETHERSCAN_API_KEY,
    apiURL: "https://api.etherscan.io/api",
    browserURL: "https://etherscan.io",
    deploy: ["./contracts/hardhat/mainnet-deploy"],
  },
  sepolia: {
    name: "sepolia",
    chainId: 11155111,
    rpcUrl:
      "https://eth-sepolia.g.alchemy.com/v2/-papiHFcZc0tr4XSPsnwE0bhdTKLetjg",
    verifyApiKey: ETHERSCAN_API_KEY,
    apiURL: "https://api-sepolia.etherscan.io",
    browserURL: "https://sepolia.etherscan.io",
    isTestnet: true,
  },
  base: {
    name: "base",
    chainId: 8453,
    rpcUrl: BASE_RPC_URL,
    forkingBlock: BASE_FORKING_BLOCK,
    verifyApiKey: BASE_VERIFY_API_KEY,
    apiURL: "https://api.basescan.org/api",
    browserURL: "https://basescan.org",
    deploy: ["./contracts/hardhat/base-deploy"],
  },
  baseSepolia: {
    name: "baseSepolia",
    chainId: 84532,
    rpcUrl:
      "https://base-sepolia.g.alchemy.com/v2/spQc9SK_L-lIL2tJpYXuhLk2YJNwbuEr",
    verifyApiKey: BASE_VERIFY_API_KEY,
    apiURL: "https://api-sepolia.basescan.org/api",
    browserURL: "https://sepolia.basescan.org",
    isTestnet: true,
  },
  arbitrum: {
    name: "arbitrumOne",
    chainId: 42161,
    rpcUrl:
      "https://arbitrum-mainnet.infura.io/v3/05368c74554249babb6f126ccf325401",
    verifyApiKey: ARBISCAN_API_KEY,
    apiURL: "https://api.arbiscan.io",
    browserURL: "https://arbiscan.io",
    deploy: ["./contracts/hardhat/arbi-mainnet-deploy"],
  },
  arbitrumGoerli: {
    name: "arbitrumGoerli",
    chainId: 421613,
    rpcUrl:
      "https://arbitrum-goerli.infura.io/v3/05368c74554249babb6f126ccf325401",
    verifyApiKey: ARBISCAN_API_KEY,
    apiURL: "https://api-goerli.arbiscan.io",
    browserURL: "https://goerli.arbiscan.io",
    isTestnet: true,
  },
  linea: {
    name: "linea",
    chainId: 59144,
    rpcUrl:
      "https://linea-mainnet.infura.io/v3/05368c74554249babb6f126ccf325401",
    verifyApiKey: LINEASCAN_API_KEY,
    apiURL: "https://api.lineascan.build/api",
    browserURL: "https://lineascan.build",
  },
  xlayer: {
    name: "xlayer",
    chainId: 196,
    rpcUrl: "https://rpc.xlayer.tech",
    verifyApiKey: OKXSCAN_API_KEY,
    apiURL:
      "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER",
    browserURL: "https://www.oklink.com/xlayer",
  },
  xlayer_testnet: {
    name: "xlayer_testnet",
    chainId: 195,
    rpcUrl: "https://testrpc.xlayer.tech",
    verifyApiKey: OKXSCAN_API_KEY,
    apiURL:
      "https://www.oklink.com/api/v5/explorer/contract/verify-source-code-plugin/XLAYER_TESTNET",
    browserURL: "https://www.oklink.com/xlayer-test",
    isTestnet: true,
  },
};

// Fork configuration
const forkTarget = HARDHAT_FORK_TARGET?.toLowerCase();
if (!HARDHAT_FORK_TARGET || !networkConfigs[forkTarget]) {
  throw Error("Missing or erroneous fork target");
}

function makeForkConfig(): HardhatNetworkUserConfig {
  const config = networkConfigs[forkTarget];

  console.log(
    `=> Hardhat forking ${forkTarget.toUpperCase()}${config.forkingBlock ? ` at block ${config.forkingBlock}` : ""}\n`
      .magenta,
  );

  return {
    chainId: config.chainId,
    deploy: config.deploy,
    saveDeployments: true,
    allowUnlimitedContractSize: true,
    forking: {
      url: config.rpcUrl,
      blockNumber:
        config.forkingBlock === "latest"
          ? undefined
          : Number(config.forkingBlock),
    },
    mining: {
      auto: true,
      mempool: {
        order: "fifo",
      },
    },
    accounts: [
      {
        privateKey: DEPLOYER_PK,
        balance: parseEther("100000").toString(),
      },
    ],
  };
}

// Generate networks config from networkConfigs
const networks = Object.entries(networkConfigs).reduce(
  (
    acc: {
      [key: string]: NetworkUserConfig;
    },
    [key, network],
  ) => {
    acc[key] = {
      chainId: network.chainId,
      url: network.rpcUrl,
      accounts: DEPLOYER_PK ? [DEPLOYER_PK] : [],
      saveDeployments: true,
      deploy: network.deploy,
      verify: {
        etherscan: {
          apiKey: network.verifyApiKey,
          apiUrl: network.apiURL,
        },
      },
    };
    return acc;
  },
  {},
);

// Generate etherscan config from networkConfigs
const etherscan = {
  apiKey: Object.entries(networkConfigs).reduce(
    (
      acc: {
        [key: string]: string;
      },
      [_, network],
    ) => {
      acc[network.name] = network.verifyApiKey;
      return acc;
    },
    {},
  ),
  customChains: Object.values(networkConfigs)
    .filter((network) => network.name !== "mainnet")
    .map((network) => ({
      network: network.name,
      chainId: network.chainId,
      urls: {
        apiURL: network.apiURL,
        browserURL: network.browserURL,
      },
    })),
};

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.18",
        settings: {
          optimizer: {
            enabled: true,
            runs: 100,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts/src",
    cache: "./contracts/hardhat/cache",
    artifacts: "./contracts/hardhat/artifacts",
    deploy: "./contracts/hardhat/deploy",
    deployments: "./contracts/hardhat/deployments",
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  networks: {
    hardhat: makeForkConfig(),
    ...networks,
  },
  etherscan,
  okxweb3explorer: {
    apiKey: OKXSCAN_API_KEY,
  },
  defaultNetwork: "hardhat",
};

export default config;
