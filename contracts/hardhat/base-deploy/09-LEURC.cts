import { type DeployFunction } from "hardhat-deploy/dist/types";
import dependencies from "../../dependencies.json";

const LTOKEN_SYMBOL = "LEURC";
const UNDERLYING_TOKEN_SYMBOL = "EURC";

module.exports = (async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  // Retrieve global contracts
  const globalOwner = await deployments.get("GlobalOwner");
  const globalPause = await deployments.get("GlobalPause");
  const globalBlacklist = await deployments.get("GlobalBlacklist");

  // Retrieve LDYStaking contract
  const ldyStaking = await deployments.get("LDYStaking");

  // Retrieve APRHistory library
  const aprHistory = await deployments.get("APRHistory");

  // Else use network implementation of the underlying token
  const missingAddressError = new Error(
    `${UNDERLYING_TOKEN_SYMBOL} address not available, ensure it is set in dependencies.json`,
  );
  // Check if the underlying token is set in dependencies.json
  if (!Object.keys(dependencies).includes(UNDERLYING_TOKEN_SYMBOL))
    throw missingAddressError;

  // Check address of underlying token is available for the current chain in dependencies.json
  // @bw these are bad
  // @ts-ignore
  if (!Object.keys(dependencies[UNDERLYING_TOKEN_SYMBOL]).includes(chainId))
    throw missingAddressError;

  // Retrieve underlying token address from dependencies.json
  // @ts-ignore
  const underlyingAddress = dependencies[UNDERLYING_TOKEN_SYMBOL][chainId];

  // Deploy the LToken
  await deployments.deploy(LTOKEN_SYMBOL, {
    contract: "LToken",
    from: deployer,
    log: true,
    proxy: {
      proxyContract: "UUPS",
      execute: {
        init: {
          methodName: "initialize",
          args: [
            globalOwner.address,
            globalPause.address,
            globalBlacklist.address,
            ldyStaking.address,
            underlyingAddress,
          ],
        },
      },
    },
    // gasLimit: 30000000, // Required as RPC node fails to estimate gas limit
    libraries: {
      APRHistory: aprHistory.address,
    },
    waitConfirmations: 1,
  });
}) as DeployFunction;
