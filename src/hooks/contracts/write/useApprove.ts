import { wagmiConfig } from "@/config/wagmi";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";
import {
  ExecuteReturn,
  simulateGenericErc20Approve,
  useWriteGenericErc20Approve,
  TransactionStatus,
} from "@/types";
import { useEffect, useState } from "react";
import { Address, Hash, parseUnits, zeroAddress } from "viem";

export type ParamsApprove = {
  amount: string;
  tokenDecimals: number;
  spender: Address | undefined;
};

type FormattedParams = {
  amount: bigint;
  spender: Address;
};

type Instance = {
  writeContract: ReturnType<
    typeof useWriteGenericErc20Approve
  >["writeContractAsync"];
  hash: Hash | undefined;
  error: Error | null;
  chainId: number;
  address: Address | undefined;
  status: TransactionStatus;
};

function formatParams(params: ParamsApprove): FormattedParams {
  return {
    amount: parseUnits(params.amount, params.tokenDecimals),
    spender: params.spender as Address,
  };
}

function checkParams(params: ParamsApprove): string | undefined {
  const { amount, spender } = formatParams(params);

  if (!amount || amount === 0n) {
    return "Missing amount input";
  }

  if (!spender || spender === zeroAddress) {
    return "Missing spender address";
  }

  return;
}

function makeInstance(address: Address | undefined): Instance {
  const { appChainId } = useWeb3Context();

  if (!address) console.error(`Contract address of the token is missing`);

  // Hook for transaction execution only
  const {
    data: hash,
    error,
    writeContractAsync,
    status,
  } = useWriteGenericErc20Approve();

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
  params: ParamsApprove,
): Promise<string | undefined> {
  if (!instance.address) {
    return "Contract address not found";
  }

  // Validate parameters first
  const validationError = checkParams(params);
  if (validationError) {
    return validationError;
  }

  const { amount, spender } = formatParams(params);

  // Run simulation and check if it throws an error
  try {
    await simulateGenericErc20Approve(wagmiConfig, {
      address: instance.address,
      chainId: instance.chainId,
      args: [spender, amount],
    });
  } catch (err: any) {
    return `Simulation error: ${(err as Error).message ?? "Unknown error"}`;
  }
}

async function execute(
  instance: Instance,
  params: ParamsApprove,
): Promise<ExecuteReturn> {
  try {
    if (!instance.address) throw Error("Contract address not found");

    // Format parameters for execution
    const { amount, spender } = formatParams(params);

    // Execute the transaction
    const hash = await instance.writeContract({
      address: instance.address,
      chainId: instance.chainId,
      args: [spender, amount],
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

export const configApprove = {
  makeInstance,
  checkParams,
  simulate,
  execute,
};
