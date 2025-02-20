import { Spinner } from "@/components/ui/Spinner";
import { getContractAddress } from "@/lib/getContractAddress";
import { twMerge } from "tailwind-merge";
// Components
import { Amount, Button, Rate } from "@/components/ui";
import {
  SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { TokenLogo } from "../../ui/TokenLogo";
import { DepositDialog } from "../DepositDialog";
import { WithdrawDialog } from "../WithdrawDialog";
// Functions
import { formatUnits } from "viem";
// Hooks
import { useTokenPricesUsd } from "../../../hooks/api/useTokenPricesUsd";
import { useAvailableLTokens } from "@/hooks/useAvailableLTokens";
import { useEffect, useRef, useState } from "react";
import { useLTokenInfos } from "@/hooks/contracts/read/useLTokenInfos";
import { useLTokenMultichainTvl } from "@/hooks/contracts/useLTokenMultichainTvl";
import { useCurrentChain } from "@/hooks/useCurrentChain";
import { useAccount } from "wagmi";
import { useWeb3Context } from "@/hooks/context/Web3ContextProvider";

type Pool = {
  underlyingSymbol: string;
  apr: number;
  tvl: number;
  invested: bigint;
  decimals: number;
};

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
export function AppInvestTokens({ className }: { className?: string }) {
  const { appChainId, currentAccount } = useWeb3Context();

  const [sorting, setSorting] = useState<SortingState>([]);
  const columnHelper = createColumnHelper<Pool>();
  const lTokens = useAvailableLTokens();
  const [isLoading, setIsLoading] = useState(true);
  const [tableData, setTableData] = useState<Pool[]>([]);
  const currentChain = useCurrentChain();
  let isActionsDialogOpen = useRef(false);
  let futureTableData = useRef<Pool[]>([]);

  const tokenInfos = useLTokenInfos(
    lTokens.map((symbol) => getContractAddress(symbol, currentChain?.id || 0)),
    currentAccount,
  );

  const underlyingPrices = useTokenPricesUsd(
    tokenInfos.map((info) => info.symbol.slice(1)),
  );

  const tvlData = useLTokenMultichainTvl();

  useEffect(() => {
    const newTableData = tokenInfos.map((data) => {
      const { symbol, apr, balance, decimals } = data;
      const tokenPriceUsd =
        underlyingPrices[symbol.toLowerCase().slice(1)] || 1;

      const totalTvl =
        Number(
          formatUnits(
            tvlData.find((tvl) => tvl.symbol === symbol)?.totalTvl || 0n,
            decimals,
          ),
        ) * tokenPriceUsd;

      return {
        underlyingSymbol: symbol.slice(1),
        invested: balance,
        tvl: totalTvl,
        decimals,
        apr: apr,
      };
    });

    // Update table data only if it has changed
    if (JSON.stringify(tableData) != JSON.stringify(newTableData)) {
      setTableData(newTableData);
      setIsLoading(false);
    }
  }, [currentAccount, appChainId, tokenInfos, tvlData, underlyingPrices]);

  const columns = [
    columnHelper.accessor("underlyingSymbol", {
      header: "Name",
      cell: (info) => {
        const underlyingSymbol = info.getValue();
        return (
          <div className="inline-flex items-center gap-2.5">
            <TokenLogo
              symbol={underlyingSymbol}
              size={35}
              className="border border-bg/80"
            />
            <p className="text-xl font-bold text-fg/80 min-[480px]:inline hidden">
              {underlyingSymbol}
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
        const amount = info.getValue();
        return (
          <Amount
            value={amount}
            decimals={0} // already formatted
            prefix={"$ "} // expressed in USD
            displaySymbol={false}
            className="text-lg font-semibold "
          />
        );
      },
      header: "TVL",
    }),
    columnHelper.accessor("invested", {
      cell: (info) => {
        const amount = info.getValue();
        const decimals = info.row.original.decimals;
        const underlyingSymbol = info.row.original.underlyingSymbol;
        return (
          <Amount
            value={amount}
            decimals={decimals}
            suffix={underlyingSymbol}
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
        const underlyingSymbol = row.getValue("underlyingSymbol") as string;
        return (
          <div className="flex items-center sm:gap-4 gap-2">
            <DepositDialog
              underlyingSymbol={underlyingSymbol}
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
              underlyingSymbol={underlyingSymbol}
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
              header.column.id === "underlyingSymbol" &&
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
          return tableRows.map((row, i) =>
            row.getVisibleCells().map((cell, cellIndex) => (
              <div
                key={cell.id}
                className={twMerge(
                  "inline-flex items-center justify-center py-6",
                  cellIndex === 0 && "justify-start sm:pl-10 pl-5",
                  i == tableRows.length - 1 && "border-b border-b-fg/20",
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
}
