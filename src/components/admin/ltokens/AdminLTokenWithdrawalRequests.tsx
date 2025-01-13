import {
  Address,
  AllowanceTxButton,
  Amount,
  Button,
  Card,
  Spinner,
  TxButton,
} from "@/components/ui";
import { useContractAddress } from "@/hooks/useContractAddress";
import { FC, useEffect, useState, useMemo } from "react";
import { AdminBrick } from "../AdminBrick";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  readLToken,
  useReadGenericErc20Allowance,
  useReadLTokenDecimals,
  useReadLTokenGetExpectedRetained,
  useReadLTokenUnderlying,
  useReadLTokenUsableUnderlyings,
  useReadLTokenWithdrawalQueue,
  useReadLTokenWithdrawalQueueCursor,
  useSimulateLTokenProcessBigQueuedRequest,
  useSimulateLTokenProcessQueuedRequests,
  useSimulateLTokenRepatriate,
  useWriteLTokenProcessBigQueuedRequest,
  writeGenericErc20Approve,
  writeLTokenProcessBigQueuedRequest,
} from "@/generated";
import clsx from "clsx";
import {
  UseSimulateContractReturnType,
  useAccount,
  useBlockNumber,
} from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/dapp/wagmi";

interface ProcessBigRequestButtonProps {
  lTokenAddress: `0x${string}`;
  requestId: bigint;
}

const ProcessBigRequestButton: FC<ProcessBigRequestButtonProps> = ({
  lTokenAddress,
  requestId,
}) => {
  // const preparation = useSimulateLTokenProcessBigQueuedRequest({
  //   address: lTokenAddress,
  //   args: [requestId],
  // });
  // const memoizedPreparation = useMemo(() => {
  //   return preparation as unknown as UseSimulateContractReturnType;
  // }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  const account = useAccount();
  const { data: underlyingAddress } = useReadLTokenUnderlying({
    address: lTokenAddress,
  });
  const { data: requestData } = useReadLTokenWithdrawalQueue({
    address: lTokenAddress,
    args: [requestId],
  });
  const { data: allowance } = useReadGenericErc20Allowance({
    address: underlyingAddress!,
    args: [account.address!, lTokenAddress],
  });

  return (
    <div className="flex gap-3 justify-center items-center">
      <Button
        size="tiny"
        isLoading={allowance === undefined}
        disabled={
          allowance === undefined ||
          allowance >= (requestData ? requestData[1] : 0n)
        }
        onClick={() => {
          writeGenericErc20Approve(wagmiConfig, {
            address: underlyingAddress!,
            args: [lTokenAddress, requestData ? requestData[1] : 0n],
          });
        }}
      >
        1. Allow
      </Button>
      <Button
        size="tiny"
        isLoading={allowance === undefined}
        disabled={
          allowance === undefined ||
          allowance < (requestData ? requestData[1] : 0n)
        }
        onClick={() => {
          writeLTokenProcessBigQueuedRequest(wagmiConfig, {
            address: lTokenAddress,
            args: [requestId],
          });
        }}
      >
        2. Process
      </Button>
    </div>
    // <AllowanceTxButton
    //   token={underlyingAddress!}
    //   spender={lTokenAddress!}
    //   amount={requestData ? requestData[1] : 0n}
    //   size="tiny"
    //   preparation={memoizedPreparation}
    //   transactionSummary={`Process big request with ID = ${Number(requestId)}`}
    // >
    //   Process
    // </AllowanceTxButton>
  );
};

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

interface WithdrawalRequest {
  id: bigint;
  amount: bigint;
  account: string;
  isBig: boolean;
}

export const AdminLTokenWithdrawalRequests: FC<Props> = ({ lTokenSymbol }) => {
  const lTokenAddress = useContractAddress(lTokenSymbol);
  const { data: decimals } = useReadLTokenDecimals({ address: lTokenAddress });
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "id",
      desc: false,
    },
  ]);
  const columnHelper = createColumnHelper<WithdrawalRequest>();
  const [requestsData, setRequestsData] = useState<WithdrawalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: queueCursor } = useReadLTokenWithdrawalQueueCursor({
    address: lTokenAddress,
  });
  const { data: expectedRetained } = useReadLTokenGetExpectedRetained({
    address: lTokenAddress,
  });
  const { data: usableUnderlyings } = useReadLTokenUsableUnderlyings({
    address: lTokenAddress,
  });
  const [nonBigRequestsCount, setNonBigRequestsCount] = useState(0);
  const [repatriationNeeded, setRepatriationNeeded] = useState(false);
  const [repatriationAmount, setRepatriationAmount] = useState(0n);
  const processNonBigPreparation = useSimulateLTokenProcessQueuedRequests({
    address: lTokenAddress,
  });
  const repatriationPreparation = useSimulateLTokenRepatriate({
    address: lTokenAddress,
    args: [repatriationAmount],
  });
  const { data: underlyingAddress } = useReadLTokenUnderlying({
    address: lTokenAddress,
  });

  const computeRequestsData = async () => {
    // setIsLoading(true);
    // If queue cursor is available
    if (typeof queueCursor === "bigint") {
      let endOfQueueEncountered = false;
      const newRequestsData: WithdrawalRequest[] = [];
      let readQueueCursor = queueCursor;
      // Until we reach the end of the queue
      while (!endOfQueueEncountered) {
        const proms: Promise<readonly [`0x${string}`, bigint]>[] = [];
        // Retrieve batch of 50 queued requests data
        for (let i = readQueueCursor; i < readQueueCursor + 50n; i++) {
          proms.push(
            readLToken(wagmiConfig, {
              address: lTokenAddress!,
              functionName: "withdrawalQueue",
              args: [i],
            }),
          );
        }
        // Wait for all data requests to settle
        const _requestsData = await Promise.allSettled(proms);
        // Add requests data to the new data array
        for (let i = readQueueCursor; i < readQueueCursor + 50n; i++) {
          const _requestData = _requestsData[Number(i - readQueueCursor)];
          if (_requestData.status === "fulfilled") {
            const [account, amount] = _requestData.value;
            // Skip already processed requests
            if (Number(account) == 0) continue;
            // Else, add request data to the new data array
           
            newRequestsData.push({
              id: i,
              account: account,
              amount: amount,
              isBig: amount > expectedRetained! / 2n,
            });
          }
          // If an error occurred, we reached the end of the queue
          else {
            endOfQueueEncountered = true;
          }
        }
        // Increment queue cursor for next batch
        readQueueCursor += 50n;
      }
      // Set new data
      setRequestsData(newRequestsData);
    }
    // setIsLoading(false);
  };

  useEffect(() => {
    computeRequestsData();
  }, [queueCursor]);

  const requestsColumns = [
    columnHelper.accessor("id", {
      header: "ID",
      cell: (info) => Number(info.getValue()),
    }),
    columnHelper.accessor("amount", {
      header: "Amount",
      cell: (info) => (
        <Amount
          value={info.getValue()}
          decimals={decimals}
          suffix={lTokenSymbol}
          displaySymbol={false}
        />
      ),
    }),
    columnHelper.accessor("account", {
      header: "Account",
      cell: (info) => (
        <Address
          address={info.getValue() as `0x${string}`}
          copyable={true}
          tooltip={true}
        />
      ),
    }),
    columnHelper.accessor("isBig", {
      header: "Big",
      cell: (info) => {
        if (!info.getValue()) return "No";
        else {
          const requestId = requestsData[info.row.index].id;
          return (
            <ProcessBigRequestButton
              requestId={requestId}
              lTokenAddress={lTokenAddress!}
            />
          );
        }
      },
    }),
  ];

  const sortableColumns = ["id", "account", "amount", "isBig"];

  const table = useReactTable({
    data: requestsData,
    columns: requestsColumns,
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

  // Get only header group
  const headerGroup = table.getHeaderGroups()[0];

  useEffect(() => {
    // Retrieve data about non-big requests
    const nonBigData = requestsData.reduce(
      (acc, item) => {
        if (item.isBig === false) {
          acc.count++;
          acc.totalAmount += item.amount;
        }
        return acc;
      },
      { count: 0, totalAmount: 0n },
    );

    // Set non-big requests count and amount
    setNonBigRequestsCount(nonBigData.count);

    // Retrieve whether repatriation is needed, and if so, how much
    const _repatriationNeeded = nonBigData.totalAmount > usableUnderlyings!;
    const _repatriationAmount = _repatriationNeeded
      ? nonBigData.totalAmount - usableUnderlyings!
      : 0n;

    // Set repatriation states
    setRepatriationNeeded(_repatriationNeeded);
    setRepatriationAmount(_repatriationAmount);
  }, [requestsData]);

  const memoizedRepatriationPreparation = useMemo(() => {
    return repatriationPreparation as unknown as UseSimulateContractReturnType;
  }, [
    repatriationPreparation.data?.request,
    repatriationPreparation.error,
    repatriationPreparation.isLoading,
  ]);

  const memoizedProcessNonBigPreparation = useMemo(() => {
    return processNonBigPreparation as unknown as UseSimulateContractReturnType;
  }, [
    processNonBigPreparation.data?.request,
    processNonBigPreparation.error,
    processNonBigPreparation.isLoading,
  ]);

  return (
    <AdminBrick
      title="Withdrawal requests"
      className="flex flex-col items-center justify-center p-16 pt-8 [column-span:all;]"
    >
      <div className="flex flex-col gap-5">
        <h4 className="font-heading text-xl font-bold">Actions needed</h4>
        {isLoading ? (
          <div className="my-10 flex w-full items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <ul className="-mt-2 mb-5 flex list-inside list-disc flex-col gap-2 pl-5">
            <li>
              <div className="inline-flex items-center gap-3 text-lg">
                {nonBigRequestsCount > 0 ? (
                  <>
                    <p className="text-lg">
                      <span className="font-bold">{nonBigRequestsCount}</span>{" "}
                      non-big requests to process:
                    </p>
                    <TxButton
                      size="tiny"
                      preparation={memoizedProcessNonBigPreparation}
                      transactionSummary="Process as much as possible non-big requests"
                    >
                      Process
                    </TxButton>
                  </>
                ) : (
                  <span className="text-fg/50">
                    No non-big requests to process.
                  </span>
                )}
              </div>
            </li>
            <li>
              <div className="inline-flex items-center gap-3 text-lg">
                {repatriationNeeded ? (
                  <>
                    <p>
                      <Amount
                        value={repatriationAmount}
                        decimals={decimals}
                        suffix={lTokenSymbol.slice(1)}
                        className="font-bold"
                      />{" "}
                      are missing to process all non-big requests:
                    </p>
                    <AllowanceTxButton
                      size="tiny"
                      amount={repatriationAmount}
                      token={underlyingAddress!}
                      spender={lTokenAddress!}
                      preparation={memoizedRepatriationPreparation}
                      transactionSummary={
                        <>
                          Repatriate{" "}
                          <Amount
                            value={repatriationAmount}
                            decimals={decimals}
                            suffix={lTokenSymbol.slice(1)}
                            className="font-bold"
                          />{" "}
                          on {lTokenSymbol} contract.
                        </>
                      }
                    >
                      Repatriate
                    </AllowanceTxButton>
                  </>
                ) : (
                  <span className="text-fg/50">No repatriation needed.</span>
                )}
              </div>
            </li>
            <li>
              <div className="inline-flex items-center gap-3 text-lg">
                {requestsData.length - nonBigRequestsCount > 0 ? (
                  <p>
                    <span className="font-bold">
                      {requestsData.length - nonBigRequestsCount}
                    </span>{" "}
                    big requests to process.
                  </p>
                ) : (
                  <span className="text-fg/50">No big request to process.</span>
                )}
              </div>
            </li>
          </ul>
        )}
        <h4 className="font-heading text-xl font-bold">
          Requests queue ({requestsData.length})
        </h4>
        <div className="grid grid-cols-[repeat(4,minmax(0,200px))] border-b border-b-fg/20 ">
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
                className="inline-flex items-center justify-center border-y border-y-fg/10 bg-fg/5 py-3 font-semibold text-fg/50"
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
            const tableRows = table.getRowModel().rows;

            if (isLoading)
              return (
                <div className="col-span-4 my-10 flex w-full items-center justify-center">
                  <Spinner />
                </div>
              );
            else if (tableRows.length === 0)
              return (
                <p className="col-span-4 my-10 block w-full text-center text-lg font-semibold text-fg/60">
                  No requests yet.
                </p>
              );
            else {
              return tableRows.map((row, rowIndex) =>
                row.getVisibleCells().map((cell, cellIndex) => (
                  <div
                    key={cell.id}
                    style={{
                      gridColumnStart: cellIndex + 1,
                    }}
                    className={clsx(
                      "inline-flex items-center justify-center border-b border-b-fg/20 py-3 text-[0.9rem] text-lg font-medium text-fg/90",
                      rowIndex == tableRows.length - 1 && "border-b-0",
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                )),
              );
            }
          })()}
        </div>
      </div>
    </AdminBrick>
  );
};
