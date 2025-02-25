import { wagmiConfig } from "@/config/wagmi";
import { getContractAddress } from "@/functions/getContractAddress";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import {
  simulateLdyStakingStake,
  useWriteLdyStakingStake,
  ExecuteReturn,
  TransactionStatus,
} from "@/types";
import { Address, Hash, parseUnits } from "viem";

export type ParamsStake = {
  amount: string;
  tokenDecimals: number;
  stakeDurationIndex: number;
};

type FormattedParams = {
  amount: bigint;
  stakeDurationIndex: number;
};

type Instance = {
  writeContract: ReturnType<
    typeof useWriteLdyStakingStake
  >["writeContractAsync"];
  hash: Hash | undefined;
  error: Error | null;
  chainId: number;
  address: Address | undefined;
  status: TransactionStatus;
};

function formatParams(params: ParamsStake): FormattedParams {
  return {
    amount: parseUnits(params.amount, params.tokenDecimals),
    stakeDurationIndex: params.stakeDurationIndex,
  };
}

function checkParams(params: ParamsStake): string | undefined {
  const { amount, stakeDurationIndex } = formatParams(params);

  if (!amount || amount === 0n) {
    return "Missing amount input";
  }

  if (stakeDurationIndex < 0 || stakeDurationIndex > 255) {
    return "Invalid stake duration index";
  }

  return;
}

function makeInstance(): Instance {
  const { appChainId } = useWeb3Context();
  const address = getContractAddress("LDYStaking");

  if (!address)
    console.error(
      `Contract address of ${"LdyStaking"} not found for chainId ${appChainId}`,
    );

  // Hook for transaction execution only
  const {
    data: hash,
    error,
    writeContractAsync,
    status,
  } = useWriteLdyStakingStake();

  return {
    writeContract: writeContractAsync,
    hash,
    error,
    chainId: appChainId,
    address,
    status,
  };
}

async function simulate(
  instance: Instance,
  params: ParamsStake,
): Promise<string | undefined> {
  if (!instance.address) {
    return "Contract address not found";
  }

  // Validate parameters first
  const validationError = checkParams(params);
  if (validationError) {
    return validationError;
  }

  const { amount, stakeDurationIndex } = formatParams(params);

  // Run simulation and check if it throws an error
  try {
    await simulateLdyStakingStake(wagmiConfig, {
      args: [amount, stakeDurationIndex],
    });
  } catch (err: any) {
    return `Simulation error: ${(err as Error).message ?? "Unknown error"}`;
  }
}

async function execute(
  instance: Instance,
  params: ParamsStake,
): Promise<ExecuteReturn> {
  try {
    // Format parameters for execution
    const { amount, stakeDurationIndex } = formatParams(params);
    // Execute the transaction
    const hash = await instance.writeContract({
      args: [amount, stakeDurationIndex],
    });

    return {
      hash, // returns the hash
      status: instance.status,
    };
  } catch (err: any) {
    return {
      status: "error",
      error: err.message || "Operation failed",
    };
  }
}

export const configStake = {
  makeInstance,
  checkParams,
  simulate,
  execute,
};
