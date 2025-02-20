import { defineConfig } from "@wagmi/cli";
import { hardhat, react, actions } from "@wagmi/cli/plugins";
import deployments from "./contracts/deployments.json";

// Converts deployments data into format awaited by the hardhat plugin
// See: https://wagmi.sh/cli/plugins/hardhat#deployments-optional
let hhPluginDeployments = {};
for (let chainId in deployments) {
  let contractList =
    deployments[chainId as keyof typeof deployments][0].contracts;
  for (const [contractName, contractData] of Object.entries(contractList)) {
    if (contractName.includes("_")) continue; // Exclude proxies' implementation contracts
    if (!hhPluginDeployments[contractName])
      hhPluginDeployments[contractName] = {};
    hhPluginDeployments[contractName][chainId] = contractData.address;
  }
}

export default defineConfig({
  out: "src/types/contractTypes.ts",
  plugins: [
    hardhat({
      project: "./contracts/hardhat/",
      deployments: hhPluginDeployments,
      include: ["contracts/src/**", "contracts/dev/**"],
      exclude: ["contracts/src/abstracts/**", "contracts/src/libs/**"],
    }),
    react(),
    actions(),
  ],
});
