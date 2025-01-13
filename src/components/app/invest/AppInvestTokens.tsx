import { Amount, Button, Card, Rate } from "@/components/ui";
import React, { FC, useEffect, useRef, useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";
import { twMerge } from "tailwind-merge";
import { TokenLogo } from "../../ui/TokenLogo";
import { DepositDialog } from "../DepositDialog";
import { WithdrawDialog } from "../WithdrawDialog";
import { lTokenAbi } from "@/generated";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { getContractAddress } from "@/lib/getContractAddress";
import { Spinner } from "@/components/ui/Spinner";
import { zeroAddress } from "viem";
import { watchBlockNumber, readContracts } from "@wagmi/core";
import { wagmiConfig } from "@/lib/dapp/wagmi";
import { useAccount } from "wagmi";
import { JSONStringify } from "@/lib/jsonStringify";
import { useSwitchAppTab } from "@/hooks/useSwitchAppTab";
import { useCurrentChain } from "@/hooks/useCurrentChain";

const availableChains = [42161, 59144];

interface Pool {
  tokenSymbol: string;
  apr: number;
  tvl: [bigint, number];
  invested: [bigint, number];
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {}
/**
 * About 'tableData', 'futureTableData' and 'isActionsDialogOpen': As the table is automatically
 * refreshed when on-chain data changes, and while DepositDialog and WithdrawDialog contained in the
 * table, if the data changes while the dialog is open, the dialog will be closed. To avoid a poor UX:
 *
 * 1. We track if any actions dialog is opened in 'isActionsDialogOpen' ref
 * 2. When new data are received, if not actions dialog are opened -> call setTableData() instantly
 * 3. Else we store the new data into 'futureTableData' ref to prevent causing a re-render of the table
 *    while the user is in deposit/withdraw modals
 * 4. Finally, when the user closes the action modal, we call 'setTableData(futureTableData)' to provides it
 *    with most up to date data.
 */
export const AppInvestTokens: FC<Props> = ({ className }) => {
  const { switchTab } = useSwitchAppTab();
  const account = useAccount();
  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<Pool>();
  const lTokens = useAvailableLTokens();
  const [readsConfig, setReadsConfig] = useState<
    Parameters<typeof readContracts>[1]["contracts"]
  >([]);
  const [tableData, setTableData] = useState<Pool[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentChain = useCurrentChain();
  let isActionsDialogOpen = useRef(false);
  let futureTableData = useRef<Pool[]>([]);

  const columns = [
    columnHelper.accessor("tokenSymbol", {
      header: "Name",
      cell: (info) => {
        const tokenSymbol = info.getValue();
        return (
          <div className="inline-flex items-center gap-2.5">
            <TokenLogo
              symbol={tokenSymbol}
              size={35}
              className="border border-bg/80"
            />
            <p className="text-xl font-bold text-fg/80 min-[480px]:inline hidden">
              {tokenSymbol}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("apr", {
      cell: (info) => (
        <div className="inline-flex items-center gap-2">
          <Rate
            value={info.getValue()}
            className="text-lg font-bold text-primary"
          />
        </div>
      ),
      header: "APR",
    }),
    columnHelper.accessor("tvl", {
      cell: (info) => {
        const [amount, decimals] = info.getValue() as [bigint, number];
        const tokenSymbol = info.row.getValue("tokenSymbol") as string;
        return (
          <Amount
            value={amount}
            decimals={decimals}
            suffix={tokenSymbol}
            displaySymbol={false}
            className="text-lg font-semibold "
          />
        );
      },
      header: "TVL",
    }),
    columnHelper.accessor("invested", {
      cell: (info) => {
        const [amount, decimals] = info.getValue() as [bigint, number];
        const tokenSymbol = info.row.getValue("tokenSymbol") as string;
        return (
          <Amount
            value={amount}
            decimals={decimals}
            suffix={tokenSymbol}
            displaySymbol={false}
            className="text-lg font-semibold text-fg/90"
          />
        );
      },
      header: "Invested",
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const tokenSymbol = row.getValue("tokenSymbol") as string;
        return (
          <div className="flex items-center sm:gap-4 gap-2">
            <DepositDialog
              underlyingSymbol={tokenSymbol}
              onOpenChange={(o) => {
                isActionsDialogOpen.current = o;
                if (o === false && futureTableData.current.length > 0) {
                  setTableData(futureTableData.current);
                  futureTableData.current = [];
                }
              }}
            >
              <Button
                size="small"
                className="text-lg inline-flex gap-1 justify-center items-center sm:aspect-auto aspect-square"
              >
                <span className="rotate-90 text-bg/90">
                  <i className="ri-login-circle-line" />
                </span>
                <span className="sm:inline-block hidden">Deposit</span>
              </Button>
            </DepositDialog>
            <WithdrawDialog
              underlyingSymbol={tokenSymbol}
              onOpenChange={(o) => {
                isActionsDialogOpen.current = o;
                if (o === false && futureTableData.current.length > 0) {
                  setTableData(futureTableData.current);
                  futureTableData.current = [];
                }
              }}
            >
              <Button
                size="small"
                variant="outline"
                className="text-lg inline-flex gap-1 justify-center items-center sm:aspect-auto aspect-square"
              >
                <span className="rotate-[270deg] text-fg/70">
                  <i className="ri-logout-circle-r-line" />
                </span>
                <span className="sm:inline-block hidden">Withdraw</span>
              </Button>
            </WithdrawDialog>
          </div>
        );
      },
    }),
  ];
  const sortableColumns: string[] = [
    // "apr", "tvl", "invested"
  ];

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getCoreRowModel: getCoreRowModel(),
  });

  const headerGroup = table.getHeaderGroups()[0];

  function populateReadsConfig() {
    // This array will host the reads requests configs built below
    const newReadsConfig = [] as {
      address: `0x${string}`;
      abi: any;
      functionName: string;
      args?: any[];
      chainId?: number;
    }[];

    if (!currentChain) return;

    // Push read calls for total supply and decimals of each lToken
    for (const lTokenSymbol of lTokens) {
      // Retrieve L-Token address on current chain
      const lTokenAddress = getContractAddress(lTokenSymbol, currentChain.id);

      // If L-Token is not available on the current chain, skip
      if (!lTokenAddress) continue;

      // Populate required reads requests
      ["symbol", "decimals", "totalSupply", "getAPR"].forEach(
        (functionName) => {
          newReadsConfig.push({
            address: lTokenAddress,
            abi: lTokenAbi,
            functionName: functionName,
          });
        },
      );
      newReadsConfig.push({
        address: lTokenAddress,
        abi: lTokenAbi,
        functionName: "balanceOf",
        args: [account.address || zeroAddress],
      });

      // Also read TVL from each chain the L-Token is available on
      for (const chainId of availableChains) {
        // Skip if current chain
        if (chainId === currentChain.id) continue;

        // Retrieve L-Token address on other chain
        const chainLTokenAddress = getContractAddress(lTokenSymbol, chainId);

        // If L-Token is not available on the other chain, skip
        if (!chainLTokenAddress) continue;

        newReadsConfig.push({
          address: chainLTokenAddress,
          abi: lTokenAbi,
          functionName: "totalSupply",
          chainId: chainId,
        });
      }
    }

    if (JSON.stringify(newReadsConfig) !== JSON.stringify(readsConfig)) {
      setIsLoading(true);
      setReadsConfig(newReadsConfig);
    }
  }

  useEffect(populateReadsConfig, [account.address, currentChain]);

  useEffect(
    () =>
      watchBlockNumber(wagmiConfig, {
        async onBlockNumber() {
          if (!currentChain) return;

          const data = await readContracts(wagmiConfig, {
            contracts: readsConfig,
          });

          if (data.length > 0) {
            const _tableData: Pool[] = [];

            while (data.length !== 0) {
              let lTokenSymbol: string;
              let decimals: number;
              let tvl: bigint;
              let apr: number;
              let investedAmount: bigint;

              // Retrieve L-Token current chain data
              try {
                lTokenSymbol = data.shift()!.result! as string;
                decimals = data.shift()!.result! as number;
                tvl = data.shift()!.result! as bigint;
                apr = data.shift()!.result! as number;
                investedAmount = data.shift()!.result! as bigint;
              } catch (e) {
                if (e instanceof TypeError) continue;
                else throw e;
              }

              // Continue if L-Token is not available on current chain
              if (!lTokenSymbol) continue;

              // Accumulate other chain TVLs too
              for (const chainId of availableChains) {
                // Skip if current chain
                if (chainId === currentChain.id) continue;

                // Retrieve L-Token address on other chain
                const chainLTokenAddress = getContractAddress(
                  lTokenSymbol,
                  chainId,
                );

                // If L-Token is not available on the other chain, skip
                if (!chainLTokenAddress) continue;

                // Retrieve TVL on other chain
                const chainTvl = data.shift()!.result! as bigint;

                // Accumulate TVL
                tvl += chainTvl;
              }

              // Build underlying symbol
              const underlyingSymbol = lTokenSymbol.slice(1);
              // Push data to table data
              _tableData.push({
                tokenSymbol: underlyingSymbol,
                invested: [investedAmount, decimals],
                tvl: [tvl, decimals],
                apr: apr,
              });
            }

            // Update table data only if it has changed
            if (JSONStringify(tableData) != JSONStringify(_tableData)) {
              if (!isActionsDialogOpen.current) setTableData(_tableData);
              else futureTableData.current = _tableData;
            }
          }
          setIsLoading(false);
        },
      }),
    [readsConfig],
  );

  return (
    <article
      className={twMerge(
        "grid w-full md:grid-cols-[repeat(5,auto)] grid-cols-[repeat(4,auto)] border-b border-b-fg/20",
        className,
      )}
    >
      {headerGroup.headers.map((header, index) => {
        return (
          <div
            key={header.id}
            className={twMerge(
              "inline-flex items-center justify-center py-3 bg-fg/5 border-y border-y-fg/10 font-semibold text-fg/50",
              header.column.id === "tokenSymbol" &&
                "justify-start sm:pl-10 pl-5",
              header.column.id === "invested" && "md:inline-flex hidden",
            )}
          >
            {(() => {
              const content = flexRender(
                header.column.columnDef.header,
                header.getContext(),
              );
              if (sortableColumns.includes(header.column.id))
                return (
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
                );
              else return content;
            })()}
          </div>
        );
      })}
      {/* <a
        onClick={() => switchTab("pre-mining")}
        className="cursor-pointer py-6 flex md:col-span-5 col-span-4 w-full items-center justify-between sm:px-10 px-5 bg-gradient-to-bl from-primary/40 to-bg  hover:opacity-80 transition-opacity border-b border-b-fg/10"
      >
        <div className="inline-flex items-center gap-2.5 relative -left-[8.5px]">
          <div className="relative w-[52px] h-[35px]">
            <TokenLogo
              symbol="USDC"
              size={35}
              className="border border-bg/80 rounded-full absolute"
            />
            <TokenLogo
              symbol="LDY"
              size={35}
              className="absolute left-[17px] border border-bg/80 rounded-full"
            />
          </div>
          <p className="text-xl font-bold text-fg/90 whitespace-nowrap">Pre-Mining</p>
        </div>
        <p className="font-semibold text-fg/90 text-lg sm:inline hidden">
          Bootstrap initial liquidity{" "}
          <span className="md:inline hidden">→ receive $LDY tokens</span>
        </p>
        <Button
          size="small"
          className="text-lg inline-flex gap-1 justify-center items-center text-bg/90"
        >
          See <i className="ri-arrow-right-line" />
        </Button>
      </a> */}
      {(() => {
        const tableRows = table.getRowModel().rows;
        if (isLoading)
          return (
            <div className="my-10 flex col-span-5 w-full items-center justify-center">
              <Spinner />
            </div>
          );
        else if (tableRows.length === 0)
          return (
            <p className="my-10 block col-span-5 w-full text-center text-lg font-semibold text-fg/60">
              No pools on this chain yet.
            </p>
          );
        else
          return tableRows.map((row, rowIndex) =>
            row.getVisibleCells().map((cell, cellIndex) => (
              <div
                key={cell.id}
                className={twMerge(
                  "inline-flex items-center justify-center py-6 border-b border-b-fg/20",
                  cellIndex === 0 && "justify-start sm:pl-10 pl-5",
                  // rowIndex == tableRows.length - 1 && "border-b-0",
                  cell.column.id === "invested" && "md:inline-flex hidden",
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            )),
          );
      })()}
    </article>
  );
};
