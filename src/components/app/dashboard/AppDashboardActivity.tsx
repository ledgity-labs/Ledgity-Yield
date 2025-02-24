"use client";
import {
  Amount,
  Button,
  Card,
  DateTime,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Spinner,
  TxButton,
} from "@/components/ui";
import React, { FC, useEffect, useState, useCallback, useMemo } from "react";
import { twMerge } from "tailwind-merge";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import clsx from "clsx";
import { Activity, LToken, execute } from "../../../../.graphclient";

import { useContractAddress } from "@/hooks/useContractAddress";
import {
  useReadLTokenDecimals,
  useReadLTokenWithdrawalQueue,
  useSimulateLTokenCancelWithdrawalRequest,
} from "@/types";
import {
  UseSimulateContractReturnType,
  useAccount,
  useBlockNumber,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

const CancelButton: FC<{
  lTokenSymbol: string;
  requestId: bigint;
  amount: bigint;
}> = ({ lTokenSymbol, requestId }) => {
  const ltokenAddress = useContractAddress(lTokenSymbol);
  const { data: decimals } = useReadLTokenDecimals({
    address: ltokenAddress,
  });
  const { data: requestData, queryKey } = useReadLTokenWithdrawalQueue({
    address: ltokenAddress,
    args: [requestId],
  });
  const preparation = useSimulateLTokenCancelWithdrawalRequest({
    address: ltokenAddress,
    args: [requestId],
  });

  useEffect(() => {
    preparation.refetch();
  }, [requestData]);

  // Refresh some data every 5 blocks
  const queryKeys = [queryKey];
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const queryClient = useQueryClient();
  useEffect(() => {
    if (blockNumber && blockNumber % 5n === 0n)
      queryKeys.forEach((k) => queryClient.invalidateQueries({ queryKey: k }));
  }, [blockNumber, ...queryKeys]);

  const memoizedPreparation = useMemo(() => {
    return preparation as unknown as UseSimulateContractReturnType;
  }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild className="absolute -inset-y-1 inset-x-0">
          <AlertDialogTrigger asChild>
            <Button
              size="tiny"
              variant="destructive"
              className="flex h-full w-full items-center justify-center rounded-lg opacity-0 transition-opacity hover:bg-opacity-100 hover:opacity-100"
            >
              <i className="ri-close-fill text-xl"></i>
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent className="font-semibold">
          Cancel withdrawal request
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone and{" "}
            <span className="font-semibold">
              you will loose your current position
            </span>{" "}
            in the withdrawal queue.
            <br />
            <br />
            By cancelling this request{" "}
            <span className="font-semibold">
              you will receive your{" "}
              <Amount
                value={requestData ? requestData[1] : 0n}
                decimals={decimals}
              />{" "}
              {lTokenSymbol}{" "}
            </span>
            tokens back to your wallet.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction customButton={true}>
            <TxButton
              variant="destructive"
              size="small"
              preparation={memoizedPreparation}
            >
              Cancel this request
            </TxButton>
          </AlertDialogAction>
          <AlertDialogCancel />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const AppDashboardActivity: React.PropsWithoutRef<typeof Card> = ({
  className,
}) => {
  const account = useAccount();
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "timestamp",
      desc: true,
    },
  ]);
  const columnHelper = createColumnHelper<Activity>();
  const [activityData, setActivityData] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const computeActivityData = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!account?.address) {
        setActivityData([]);
        setIsLoading(false);
        return;
      }

      const query = `{
        c${account.chainId}_activities(where: { account: "${account.address}" }) {
          id
          requestId
          ltoken {
            symbol
            decimals
          }
          timestamp
          action
          amount
          amountAfterFees
          status
        }
      }`;

      const result = await execute(query, {});
      const activities = result.data?.[`c${account.chainId}_activities`];

      if (!activities) {
        setActivityData([]);
        setIsLoading(false);
        return;
      }

      setActivityData(activities);
    } catch (e) {
      console.error("Failed to fetch activity data:", e);
      setActivityData([]);
    }

    setIsLoading(false);
  }, [account?.address, account?.chainId]);

  // Fetch data on mount and when account changes
  useEffect(() => {
    computeActivityData();
  }, [computeActivityData]);

  const activityColumns = [
    columnHelper.accessor("timestamp", {
      header: "Date",
      cell: (info) => {
        return (
          <DateTime
            timestamp={Number.parseInt(info.getValue()) * 1000}
            output="date"
            className="cursor-help text-fg/50"
          />
        );
      },
    }),
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("ltoken", {
      header: "L-Token",
      cell: (info) => info.getValue().symbol,
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => {
        const amount = info.getValue() as string;
        const amountAfterFees = activityData[info.row.index]
          .amountAfterFees as string;
        const ltoken = info.row.getValue("ltoken") as LToken;
        return (
          <Amount
            value={BigInt(amount)}
            decimals={ltoken.decimals}
            suffix={ltoken.symbol}
            displaySymbol={false}
            tooltipChildren={
              amount !== amountAfterFees && (
                <span>
                  <span className="font-medium opacity-80">
                    Received after fees:{" "}
                  </span>
                  <Amount
                    tooltip={false}
                    value={BigInt(amountAfterFees)}
                    decimals={ltoken.decimals}
                    suffix={ltoken.symbol}
                  />
                </span>
              )
            }
          />
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const status = info.getValue();
        const ltoken = info.row.getValue("ltoken") as LToken;
        const requestId = activityData[info.row.index].requestId;
        const amount = info.row.getValue("amount") as string;
        return (
          <div className="relative flex items-center gap-1.5 [&:hover_>_button]:opacity-100">
            <div
              className={clsx(
                "block aspect-square h-3 w-3 rounded-full border-2",
                ["Fulfilled", "Success"].includes(status) &&
                  "border-emerald-500 bg-emerald-200",
                status === "Queued" && "border-amber-500 bg-amber-200",
                status === "Cancelled" && "border-red-500 bg-red-200",
              )}
            ></div>
            <div
              className={clsx(
                "flex items-center justify-center gap-2 font-semibold",
                ["Fulfilled", "Success"].includes(status) && "text-emerald-500",
                status === "Queued" && "text-amber-500",
                status === "Cancelled" && "text-red-500",
              )}
            >
              <p>{status}</p>
            </div>
            {status === "Queued" && (
              <CancelButton
                lTokenSymbol={ltoken.symbol}
                requestId={BigInt(requestId)}
                amount={BigInt(amount)}
              />
            )}
          </div>
        );
      },
    }),
  ];
  const sortableColumns = ["timestamp", "action", "amount", "ltoken", "status"];

  const table = useReactTable({
    data: activityData ?? [], // Ensure we always have at least an empty array
    columns: activityColumns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Set page size
  useEffect(() => table.setPageSize(10), []);

  const headerGroup = table.getHeaderGroups()[0];

  return (
    <div className="w-full flex-col">
      <div
        className={twMerge(
          "grid w-full grid-cols-[repeat(5,minmax(0,200px))] border-b border-b-fg/20",
          className,
        )}
      >
        {headerGroup.headers.map((header, index) => {
          const content = flexRender(
            header.column.columnDef.header,
            header.getContext(),
          );
          return (
            <div
              key={header.column.id}
              style={{
                gridColumnStart: index + 1,
              }}
              className="inline-flex items-center justify-center py-3 bg-fg/5 border-y border-y-fg/10 font-semibold text-fg/50"
            >
              {(sortableColumns.includes(header.column.id) && (
                <button
                  onClick={() =>
                    header.column.toggleSorting(
                      header.column.getIsSorted() === "asc",
                    )
                  }
                  className="flex items-center gap-1"
                >
                  {content}
                  <span>
                    {(() => {
                      switch (header.column.getIsSorted()) {
                        case "asc":
                          return <i className="ri-sort-desc"></i>;
                        case "desc":
                          return <i className="ri-sort-asc"></i>;
                        default:
                          return <i className="ri-expand-up-down-fill"></i>;
                      }
                    })()}
                  </span>
                </button>
              )) ||
                content}
            </div>
          );
        })}
        {(() => {
          if (isLoading) {
            return (
              <div className="my-10 flex col-span-5 w-full items-center justify-center">
                <Spinner />
              </div>
            );
          }

          const tableRows = table.getRowModel().rows;

          if (!tableRows?.length) {
            return (
              <p className="my-10 col-span-5 w-full block text-center text-lg font-semibold text-fg/60">
                No activity yet.
              </p>
            );
          }

          return tableRows.map((row, rowIndex) =>
            row.getVisibleCells().map((cell, cellIndex) => (
              <div
                key={cell.id}
                style={{
                  gridColumnStart: cellIndex + 1,
                }}
                className={clsx(
                  "inline-flex items-center justify-center py-3 border-b border-b-fg/20 font-medium text-fg/90 text-[0.9rem]",
                  rowIndex == tableRows.length - 1 && "border-b-0",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            )),
          );
        })()}
      </div>
      <div className="flex justify-center items-center gap-3 py-4">
        <Button
          size="tiny"
          variant="outline"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <i className="ri-arrow-left-line" />
          &nbsp; Newer
        </Button>
        <Button
          size="tiny"
          variant="outline"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Older&nbsp;
          <i className="ri-arrow-right-line" />
        </Button>
      </div>
    </div>
  );
};
