import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import fs from "fs";
import path from "path";

task("verify-deploys", "Verifies all contracts from the latest deployment")
  .addOptionalParam("chain", "Network to verify contracts on")
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const network = taskArgs.chain || hre.network.name;
    console.log("network: ", network);
    console.log(`Verifying contracts on ${network}...`);

    // Get deployment directory for the current network
    const deploymentsDir = path.join(
      "contracts",
      "hardhat",
      "deployments",
      network,
    );

    if (!fs.existsSync(deploymentsDir)) {
      throw new Error(`No deployments found for network ${network}`);
    }

    // Read all deployment files
    const files = fs.readdirSync(deploymentsDir);
    const deployments = files
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const content = fs.readFileSync(path.join(deploymentsDir, f), "utf8");
        return {
          name: f.replace(".json", ""),
          ...JSON.parse(content),
        };
      });

    console.log(`Found ${deployments.length} deployments to verify`);

    // Verify each contract
    for (const deployment of deployments) {
      console.log("Constructor arguments: ", deployment.args);

      try {
        // Skip if no implementation (not a contract, just an artifact)
        if (!deployment.address) continue;

        console.log(`\nVerifying ${deployment.name} at ${deployment.address}`);

        // For proxies, we need to verify the implementation
        const implAddress = deployment.implementation;
        if (implAddress) {
          console.log(
            `Contract is a proxy, verifying implementation at ${implAddress}`,
          );

          // Verify implementation
          await hre.run("verify:verify", {
            address: implAddress,
            constructorArguments: [],
          });

          // Verify proxy
          await hre.run("verify:verify", {
            address: deployment.address,
            constructorArguments: deployment.args || [],
          });
        } else {
          // Verify non-proxy contract
          await hre.run("verify:verify", {
            address: deployment.address,
            constructorArguments: deployment.args || [],
          });
        }

        console.log(`✅ ${deployment.name} verified successfully`);
      } catch (error: any) {
        if (error.message.includes("already verified")) {
          console.log(`Contract ${deployment.name} is already verified`);
        } else {
          console.error(`❌ Error verifying ${deployment.name}:`, error);
        }
      }
    }

    console.log("\nVerification process completed!");
  });
