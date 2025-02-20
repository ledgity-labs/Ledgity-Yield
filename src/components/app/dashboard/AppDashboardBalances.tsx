"use client";
import {
  Amount,
  Card,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TokenLogo,
  Button,
} from "@/components/ui";
import React, { FC, useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { DepositDialog } from "../DepositDialog";
import { WithdrawDialog } from "../WithdrawDialog";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { useContractAddress } from "@/hooks/useContractAddress";
import {
  useReadLTokenBalanceOf,
  useReadLTokenDecimals,
  useReadLTokenUnderlying,
} from "@/types";
import { useAccount, useBlockNumber } from "wagmi";
import { zeroAddress } from "viem";
import { useQueryClient } from "@tanstack/react-query";

const LTokenBalance: FC<{ lTokenSymbol: string }> = ({
  lTokenSymbol,
  ...props
}) => {
  const account = useAccount();
  const address = useContractAddress(lTokenSymbol);
  const { data: balance, queryKey } = useReadLTokenBalanceOf({
    address: address!,
    args: [account.address || zeroAddress],
  });
  const { data: decimals } = useReadLTokenDecimals({ address: address! });
  const underlyingSymbol = lTokenSymbol.slice(1);

  // Refresh some data every 5 blocks
  const queryKeys = [queryKey];
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (blockNumber && blockNumber % 5n === 0n)
      queryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
  }, [blockNumber, ...queryKeys]);

  return (
    <li className="flex w-full gap-4 items-center justify-between" {...props}>
      <div className="flex items-center gap-2 font-semibold text-fg/80">
        <TokenLogo symbol={lTokenSymbol} size={30} />
        {lTokenSymbol}
      </div>
      <div className="flex items-center gap-2">
        <Amount
          value={balance!}
          decimals={decimals}
          className="pr-2 font-semibold"
          suffix={lTokenSymbol}
          displaySymbol={false}
        />
        <Tooltip>
          <TooltipTrigger>
            <DepositDialog underlyingSymbol={underlyingSymbol}>
              <Button size="tiny" className="h-8 w-8">
                <i className="ri-add-fill text-lg"></i>
              </Button>
            </DepositDialog>
          </TooltipTrigger>
          <TooltipContent className="font-heading font-semibold text-bg">
            Deposit {underlyingSymbol} against {lTokenSymbol}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <WithdrawDialog underlyingSymbol={underlyingSymbol}>
              <Button variant="outline" size="tiny" className="h-8 w-8">
                <i className="ri-subtract-fill text-lg"></i>
              </Button>
            </WithdrawDialog>
          </TooltipTrigger>
          <TooltipContent className="font-heading font-semibold text-bg">
            Withdraw {underlyingSymbol} from {lTokenSymbol}
          </TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
};
export const AppDashboardBalances: React.PropsWithoutRef<typeof Card> = ({
  className,
}) => {
  const lTokens = useAvailableLTokens();

  if (lTokens.length == 0) return <p>No balances on this chain.</p>;
  else
    return (
      <ul className="flex h-full w-full flex-col gap-7">
        {lTokens.map((lToken) => (
          <LTokenBalance key={lToken} lTokenSymbol={lToken} />
        ))}
      </ul>
    );
};
