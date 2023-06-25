import { ethers, network, upgrades } from "hardhat";
import { contracts } from "../../contracts";
import { getChainId } from "./getChainId";

export async function deployBeacon(contractName: string) {
  // Retrieve current chain Id
  const chainId = getChainId();

  // Try to upgrade the beacon contract in case it has already been deployed
  const BeaconContract = await ethers.getContractFactory(contractName);
  try {
    const beaconAddress =
      contracts[chainId] && contracts[chainId][contractName] && contracts[chainId][contractName].address;
    if (!beaconAddress) throw new Error("Address not found");
    const contract = await upgrades.upgradeBeacon(beaconAddress, BeaconContract);
    const address = await contract.getAddress();
    console.log(`Beacon ${contractName} upgraded at: ${address}`);
    return contract;
  } catch (e) {
    // Else if proxy is address is missing or invalid, deploy a new contract
    if (e instanceof Error) {
      if (
        e.message.includes("Address not found") ||
        (chainId === 31337 && e.message.includes("doesn't look like a beacon"))
      ) {
        const contract = await upgrades.deployBeacon(BeaconContract);
        const address = await contract.getAddress();
        console.log(`Beacon '${contractName}' deployed at: ${address}`);
        return contract;
      }
    }
    throw e;
  }
}
