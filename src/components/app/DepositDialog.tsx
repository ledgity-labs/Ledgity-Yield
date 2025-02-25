"use client";
import { ChangeEvent, FC, useRef, useState, useEffect, useMemo } from "react";
import {
  AmountInput,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  AllowanceTxButton,
  Amount,
  Spinner,
} from "@/components/ui";
import {
  useReadLTokenDecimals,
  useReadLTokenUnderlying,
  useSimulateLTokenDeposit,
} from "@/types";
import { getContractAddress } from "@/functions/getContractAddress";
import { erc20Abi, parseUnits, zeroAddress } from "viem";
import {
  UseSimulateContractReturnType,
  useAccount,
  useBlockNumber,
  useReadContract,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import useRestricted from "@/hooks/useRestricted";

interface Props extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  underlyingSymbol: string;
  onOpenChange?: React.ComponentPropsWithoutRef<typeof Dialog>["onOpenChange"];
}

export const DepositDialog: FC<Props> = ({
  children,
  underlyingSymbol,
  onOpenChange,
}) => {
  const account = useAccount();
  const lTokenAddress = getContractAddress(`L${underlyingSymbol}`);
  const { data: decimals } = useReadLTokenDecimals({ address: lTokenAddress! });
  const { data: underlyingAddress } = useReadLTokenUnderlying({
    address: lTokenAddress!,
  });
  const { data: underlyingBalance, queryKey } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    address: underlyingAddress,
    args: [account.address || zeroAddress],
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const inputEl = useRef<HTMLInputElement>(null);
  const [depositedAmount, setDepositedAmount] = useState(0n);
  const preparation = useSimulateLTokenDeposit({
    address: lTokenAddress!,
    args: [depositedAmount, ""],
  });

  // Refresh some data every 5 blocks
  const queryKeys = [queryKey];
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (blockNumber && blockNumber % 5n === 0n)
      queryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
  }, [blockNumber, ...queryKeys]);

  // Fetch restriction status
  const { isRestricted, isLoading: isRestrictionLoading } = useRestricted();

  const memoizedPreparation = useMemo(() => {
    return preparation as unknown as UseSimulateContractReturnType;
  }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  if (!lTokenAddress) return null;
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputEl.current?.focus();
        }}
      >
        {(() => {
          if (isRestrictionLoading)
            return (
              <div className="py-8 px-16 text-2xl">
                <Spinner />
              </div>
            );
          else if (isRestricted) {
            return (
              <div className="flex flex-col gap-5 text-lg justify-center items-center">
                <span className="text-[5rem] leading-[5rem]">🤷</span>
                <span className="text-center font-semibold">
                  Oops, you&apos;re not authorized to access this feature
                </span>
                <span className="text-base">
                  This may be due to your location or on-chain activity. <br />
                  If you think this is an error, please contact our support team
                  at{" "}
                  <a
                    href="mailto:contact@ledgity.com"
                    className="text-primary underline"
                  >
                    contact@ledgity.com
                  </a>
                </span>
              </div>
            );
          } else
            return (
              <>
                <DialogHeader>
                  <DialogTitle>Deposit {underlyingSymbol}</DialogTitle>
                  <DialogDescription>
                    <span className="text-primary font-semibold text-xl">
                      You will receive L{underlyingSymbol} in a 1:1 ratio.
                    </span>
                    <div className="flex gap-2 justify-stretch items-stretch bg-fg/[7%] text-fg/80 rounded-2xl p-4">
                      <div className="flex justify-center items-center pr-4 border-r border-r-fg/20">
                        <i className="ri-information-line text-2xl" />
                      </div>
                      <div className="pl-4 text-left">
                        <span className="font-bold">How to get the yield?</span>{" "}
                        Your L{underlyingSymbol} balance will automatically grow
                        through time to reflect your rewards. There is no need
                        to stake, lock or claim anything.
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <div className="flex gap-4 flex-nowrap items-end justify-center mt-6 mb-3 mr-3 ml-3">
                    <AmountInput
                      ref={inputEl}
                      maxValue={underlyingBalance}
                      decimals={decimals}
                      symbol={underlyingSymbol}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        setDepositedAmount(
                          parseUnits(e.target.value, decimals!),
                        );
                        if (hasUserInteracted === false)
                          setHasUserInteracted(true);
                        if (e.target.value === "") setHasUserInteracted(false);
                      }}
                    />
                    <AllowanceTxButton
                      size="medium"
                      preparation={memoizedPreparation}
                      token={underlyingAddress!}
                      spender={lTokenAddress}
                      amount={depositedAmount}
                      disabled={depositedAmount === 0n}
                      hasUserInteracted={hasUserInteracted}
                      transactionSummary={
                        <span>
                          Deposit{" "}
                          <Amount
                            value={depositedAmount}
                            decimals={decimals}
                            suffix={underlyingSymbol}
                            displaySymbol={true}
                            className="text-indigo-300 underline underline-offset-4 decoration-indigo-300 decoration-2 whitespace-nowrap"
                          />{" "}
                          against{" "}
                          <Amount
                            value={depositedAmount}
                            decimals={decimals}
                            suffix={"L" + underlyingSymbol}
                            displaySymbol={true}
                            className="text-indigo-300 underline underline-offset-4 decoration-indigo-300 decoration-2 whitespace-nowrap"
                          />
                        </span>
                      }
                    >
                      Deposit
                    </AllowanceTxButton>
                  </div>
                </DialogFooter>
              </>
            );
        })()}
      </DialogContent>
    </Dialog>
  );
};
