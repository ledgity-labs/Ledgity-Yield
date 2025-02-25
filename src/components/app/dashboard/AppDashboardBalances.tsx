"use client";

import {
  Amount,
  Button,
  TokenLogo,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import { DepositDialog } from "../DepositDialog";
import { WithdrawDialog } from "../WithdrawDialog";
// Context
import { useAppDataContext } from "@/hooks/context/AppDataContextProvider";
// Types
import { LTokenInfo } from "@/types";

export function AppDashboardBalances({ className }: { className?: string }) {
  const { lTokenInfosCurrentChain } = useAppDataContext();

  return !Object.keys(lTokenInfosCurrentChain).length ? (
    <p>No balances on this chain.</p>
  ) : (
    <ul className="flex h-full w-full flex-col gap-7">
      {lTokenInfosCurrentChain.map((tokenInfo) => (
        <LTokenBalance key={tokenInfo.name} tokenInfo={tokenInfo} />
      ))}
    </ul>
  );
}

function LTokenBalance({ tokenInfo }: { tokenInfo: LTokenInfo }) {
  const tokenSymbol = tokenInfo.symbol;
  const underlyingSymbol = tokenSymbol.slice(1);

  return (
    <li className="flex w-full gap-4 items-center justify-between">
      <div className="flex items-center gap-2 font-semibold text-fg/80">
        <TokenLogo symbol={tokenSymbol} size={30} />
        {tokenSymbol}
      </div>
      <div className="flex items-center gap-2">
        <Amount
          value={tokenInfo.balance}
          decimals={tokenInfo.decimals}
          className="pr-2 font-semibold"
          suffix={tokenSymbol}
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
            Deposit {underlyingSymbol} against {tokenSymbol}
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
            Withdraw {underlyingSymbol} from {tokenSymbol}
          </TooltipContent>
        </Tooltip>
      </div>
    </li>
  );
}
