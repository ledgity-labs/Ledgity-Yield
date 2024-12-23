"use client";
import { type FC, useEffect, type ReactNode, useState } from "react";
import {
  useSimulateContract,
  useReadContract,
  useAccount,
  UseSimulateContractReturnType,
} from "wagmi";
import { erc20Abi, zeroAddress } from "viem";
import { TxButton } from "./TxButton";
import { Amount } from "./Amount";
import { twMerge } from "tailwind-merge";

interface Props extends React.ComponentPropsWithoutRef<typeof TxButton> {
  token: `0x${string}`;
  spender: `0x${string}`;
  amount?: bigint;
  preparation: UseSimulateContractReturnType;
  transactionSummary?: string | ReactNode;
  hasUserInteracted?: boolean;
  parentIsError?: boolean;
  parentError?: string;
  allowZeroAmount?: boolean;
}

export const AllowanceTxButton: FC<Props> = ({
  token,
  spender,
  amount = 0n,
  preparation,
  transactionSummary = "",
  hasUserInteracted = false,
  parentIsError = false,
  parentError = undefined,
  allowZeroAmount = false,
  disabled,
  className,
  ...props
}) => {
  const { address: accountAddress, isConnected } = useAccount();
  const [hasEnoughAllowance, setHasEnoughAllowance] = useState(false);
  const [error, setError] = useState<{ isError: boolean; message: string }>({
    isError: false,
    message: "",
  });

  const { data: symbol } = useReadContract({
    abi: erc20Abi,
    functionName: "symbol",
    address: token,
  });

  const { data: decimals } = useReadContract({
    abi: erc20Abi,
    functionName: "decimals",
    address: token,
  });

  const { data: allowance, queryKey: allowanceQueryKey } = useReadContract({
    abi: erc20Abi,
    functionName: "allowance",
    address: token,
    args: [accountAddress || zeroAddress, spender],
  });

  const { data: balance, queryKey: balanceQueryKey } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    address: token,
    args: [accountAddress || zeroAddress],
  });

  const allowancePreparation = useSimulateContract({
    abi: erc20Abi,
    functionName: "approve",
    address: token,
    args: [spender, amount],
  });

  // Update error state
  useEffect(() => {
    if (!isConnected) {
      setError({ isError: true, message: "No wallet connected" });
    } else if (!balance || balance < amount) {
      setError({ isError: true, message: "Insufficient balance" });
    } else {
      setError({ isError: false, message: "" });
    }
  }, [isConnected, balance, amount]);

  // Update allowance state
  useEffect(() => {
    if (isConnected && allowance !== undefined) {
      preparation.refetch();
      setHasEnoughAllowance(allowance >= amount);
    }
  }, [isConnected, allowance, amount, preparation]);

  return (
    <div>
      <TxButton
        className={twMerge(
          !hasEnoughAllowance && "pointer-events-none hidden",
          className,
        )}
        hideTooltips={!hasEnoughAllowance}
        hasUserInteracted={hasUserInteracted}
        preparation={preparation}
        disabled={(amount === 0n && !allowZeroAmount) || disabled}
        transactionSummary={transactionSummary}
        parentIsError={error.isError}
        parentError={error.message}
        queryKeys={[balanceQueryKey, allowanceQueryKey]}
        {...props}
      />
      <TxButton
        className={twMerge(
          hasEnoughAllowance && "pointer-events-none hidden",
          className,
        )}
        hideTooltips={hasEnoughAllowance}
        preparation={
          allowancePreparation as unknown as UseSimulateContractReturnType
        }
        disabled={(amount === 0n && !allowZeroAmount) || disabled}
        hasUserInteracted={hasUserInteracted}
        parentIsError={parentIsError || error.isError}
        parentError={parentError || error.message}
        transactionSummary={
          <span>
            Allow Ledgity Yield to use{" "}
            <Amount
              value={amount}
              decimals={decimals}
              suffix={symbol}
              displaySymbol={true}
              className="text-indigo-300 underline decoration-indigo-300 decoration-2 underline-offset-4 whitespace-nowrap"
            />
          </span>
        }
        queryKeys={[allowanceQueryKey]}
        {...props}
      >
        Allow
      </TxButton>
    </div>
  );
};
