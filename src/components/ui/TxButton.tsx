"use client";
import { FC, type ReactNode, useEffect, useState } from "react";
import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./Dialog";
import { Spinner } from "./Spinner";
import { Tooltip, TooltipTrigger, TooltipContent } from "./Tooltip";
import {
  useWriteContract,
  usePublicClient,
  useWaitForTransactionReceipt,
  useSwitchChain,
  UseSimulateContractReturnType,
  useAccount,
} from "wagmi";
import { prettyErrorMessage } from "@/lib/prettyErrorMessage";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { BaseError } from "viem";
import { Card } from "./Card";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";
import { useQueryClient } from "@tanstack/react-query";

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {
  preparation: UseSimulateContractReturnType;
  transactionSummary?: string | ReactNode;
  hasUserInteracted?: boolean;
  hideTooltips?: boolean;
  parentIsError?: boolean;
  parentError?: string;
  queryKeys?: any[];
}

export const TxButton: FC<Props> = ({
  preparation,
  transactionSummary = "",
  disabled,
  hasUserInteracted = false,
  hideTooltips = false,
  parentIsError = false,
  parentError = undefined,
  queryKeys = [],
  ...props
}) => {
  const { isPending: isNetworkSwitching } = useSwitchChain();
  const { address: accountAddress, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    isError: isWriteError,
    isSuccess: isWriteSuccess,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isError: isConfirmError,
    isSuccess: isConfirmSuccess,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (accountAddress) {
      preparation.refetch();
    }
  }, [accountAddress]);

  useEffect(() => {
    if (isWriteSuccess && isConfirmSuccess) {
      queryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
    }
  }, [isWriteSuccess, isConfirmSuccess]);

  const isLoading = isWritePending;

  let tooltipMessage = "";
  let tooltipIsError = false;

  if (isLoading) {
    tooltipMessage = "Loading...";
  } else if (isNetworkSwitching) {
    tooltipMessage = "Switching network...";
  } else if (!isConnected) {
    tooltipIsError = true;
    tooltipMessage = "No wallet connected";
  } else if (parentIsError && parentError) {
    tooltipIsError = true;
    tooltipMessage = parentError;
  } else if (preparation.isError) {
    tooltipIsError = true;
    tooltipMessage = prettyErrorMessage(preparation.error as BaseError);
  }

  const handleClick = async () => {
    if (preparation.data?.request) {
      setIsDialogOpen(true);
      try {
        writeContract(preparation.data.request);
      } catch (error) {
        console.error("Transaction error:", error);
      }
    }
  };

  return (
    <div className="relative flex flex-col w-full">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Tooltip
          open={
            hasUserInteracted &&
            tooltipIsError &&
            !isLoading &&
            !isNetworkSwitching
              ? true
              : undefined
          }
        >
          <TooltipTrigger>
            <DialogTrigger asChild>
              <Button
                {...props}
                disabled={
                  disabled ||
                  tooltipIsError ||
                  !writeContract ||
                  isNetworkSwitching
                }
                isLoading={isLoading}
                onClick={handleClick}
              />
            </DialogTrigger>
          </TooltipTrigger>
          {tooltipMessage && !hideTooltips && (
            <TooltipContent
              className="font-semibold"
              variant={tooltipIsError ? "destructive" : "primary"}
              side="bottom"
              sideOffset={4}
            >
              {tooltipMessage}
            </TooltipContent>
          )}
        </Tooltip>

        <DialogContent className="!px-0 !sm:px-0">
          <DialogHeader>
            <DialogTitle>Ongoing transaction</DialogTitle>
            <DialogDescription className="flex flex-col items-center justify-center gap-3 px-3">
              <div className="mb-2 w-[calc(100%-4px)] whitespace-normal bg-fg/90 px-10 py-10 text-center text-lg font-semibold text-bg">
                {transactionSummary}
              </div>

              <ul
                className={clsx(
                  "relative my-5 flex flex-col gap-8",
                  "before:-z-1 before:absolute before:bottom-10 before:left-[calc(1.25rem-1.5px)] before:top-10 before:border-l-[3px] before:border-slate-300",
                )}
              >
                <li className="flex items-center justify-start gap-2">
                  {/* Write Transaction - Pending State */}
                  {!isWriteError && !isWriteSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-primary/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <Spinner />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 text-fg/90">
                        Sign transaction from your wallet
                      </p>
                    </>
                  )}

                  {/* Write Transaction - Error State */}
                  {isWriteError && !isWriteSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-red-500/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <i className="ri-close-fill text-xl" />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 text-red-600/75">
                        Wallet rejected the request
                      </p>
                    </>
                  )}

                  {/* Write Transaction - Success State */}
                  {isWriteSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-green-500/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <i className="ri-check-fill text-xl" />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 opacity-80 grayscale-[100%]">
                        Wallet signature successful
                      </p>
                    </>
                  )}
                </li>

                <li className="flex items-center justify-start gap-2">
                  {/* Confirmation - Pending State */}
                  {!isConfirmError && !isConfirmSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-primary/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <Spinner />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 text-fg/90">
                        Wait for network confirmation
                      </p>
                    </>
                  )}

                  {/* Confirmation - Error State */}
                  {isConfirmError && !isConfirmSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-red-500/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <i className="ri-close-fill text-xl" />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 text-red-600/75">
                        Transaction failed
                      </p>
                    </>
                  )}

                  {/* Confirmation - Success State */}
                  {isConfirmSuccess && (
                    <>
                      <Card
                        radius="full"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-slate-300 before:bg-green-500/75"
                      >
                        <span className="font-bold text-primary-fg">
                          <i className="ri-check-fill text-xl" />
                        </span>
                      </Card>
                      <p className="text-lg font-medium text-slate-400 opacity-80 grayscale-[100%]">
                        Transaction succeeded
                      </p>
                    </>
                  )}
                </li>
              </ul>

              {((isWriteSuccess && isConfirmSuccess) ||
                (!isWriteSuccess && (isWriteError || isConfirmError))) && (
                <p className="font-semibold">
                  You can now safely close this modal
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};
