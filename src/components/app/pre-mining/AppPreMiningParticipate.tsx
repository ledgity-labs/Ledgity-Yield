"use client";
import { FC, useMemo } from "react";
import { Amount, TxButton } from "@/components/ui";
import {
  useReadPreMiningAccountsLocks,
  useSimulatePreMiningInstantUnlock,
  useSimulatePreMiningRequestUnlock,
} from "@/generated";
import { UseSimulateContractReturnType, useAccount } from "wagmi";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { twMerge } from "tailwind-merge";
import { Progress } from "@/components/ui/Progress";

function subtractMonths(date: Date, months: number) {
  const result = new Date(date); // Clone the date to avoid mutating the original
  result.setDate(result.getDate() - 30 * months); // Subtract the days
  return result;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const AppPreMiningParticipate: FC<Props> = ({ className, ...props }) => {
  const account = useAccount();

  // Retrieve lock data
  const { data: lockData } = useReadPreMiningAccountsLocks({
    args: [account.address || zeroAddress],
  });
  const hasLocked = lockData && lockData[0] !== 0n;
  const lockAmount = hasLocked ? lockData[0] : 0n;
  const lockDuration = hasLocked ? lockData[1] : 0;
  const lockUnlocked = hasLocked ? lockData[2] : false;
  const lockEnd = hasLocked ? new Date(Number(lockData[4]) * 1000) : new Date();
  const lockStart = subtractMonths(lockEnd, lockDuration);
  const lockProgression =
    (Date.now() - lockStart.getTime()) /
    (lockEnd.getTime() - lockStart.getTime());

  // Prepare unlock
  const instantPreparation = useSimulatePreMiningInstantUnlock();
  const requestPreparation = useSimulatePreMiningRequestUnlock();

  // Compute account's eligible LDY amount
  const maxWeight = parseUnits((4_000_000 * 12).toString(), 6);
  const accountWeight = lockAmount * BigInt(lockDuration);
  const eligibleLDY = (parseUnits("1125000", 18) * accountWeight) / maxWeight;

  // Compute account's eligible airdrop entries
  const eligibleEntries =
    Number(formatUnits(lockAmount, 6)) *
    ({ 3: 1, 6: 5, 12: 25 }[lockDuration] || 0);

  const memoizedPreparation = useMemo(() => {
    return (instantPreparation.isError
      ? requestPreparation
      : instantPreparation) as unknown as UseSimulateContractReturnType;
  }, [
    instantPreparation.isError,
    instantPreparation.data?.request,
    instantPreparation.error,
    instantPreparation.isLoading,
    requestPreparation.data?.request,
    requestPreparation.error,
    requestPreparation.isLoading,
  ]);

  return (
    <div className={twMerge("flex flex-col", className)} {...props}>
      {(hasLocked && (
        <div className="bg-green-500 text-slate-50 p-5 text-center text-lg font-semibold">
          <i className="ri-checkbox-circle-line text-xl" />
          &nbsp; You participated
        </div>
      )) || (
        <div className="bg-red-500 text-slate-50 p-5 text-center text-lg font-semibold">
          <i className="ri-close-circle-line text-xl" />
          &nbsp; You didn&apos;t participated
        </div>
      )}
      {hasLocked && (
        <div className="bg-indigo-950/10 p-2">
          <div className="flex flex-col items-center gap-16 p-10 bg-accent rounded-b-3xl">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-3xl font-heading text-indigo-950/[75%]">
                  Your lock
                </h3>
                <ul className="list-disc pl-6 leading-7">
                  <li>
                    Amount:{" "}
                    <Amount
                      value={lockAmount}
                      decimals={6}
                      suffix="USDC"
                      displaySymbol={true}
                      className="font-bold"
                    />
                  </li>
                  <li>
                    Duration:{" "}
                    <span className="font-bold">{lockDuration} months</span>
                  </li>
                  <li>
                    Start:{" "}
                    <span className="font-bold">
                      {lockStart.toLocaleDateString()}
                    </span>
                  </li>
                  <li>
                    End:{" "}
                    <span className="font-bold">
                      {lockEnd.toLocaleDateString()}
                    </span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center gap-5 w-full">
                {" "}
                <Progress value={lockProgression * 100} />
                <TxButton
                  size="medium"
                  preparation={memoizedPreparation}
                  disabled={!hasLocked || lockUnlocked}
                  className=""
                  transactionSummary={
                    <span>
                      {instantPreparation.isError
                        ? "Request to unlock"
                        : "Unlock"}{" "}
                      <Amount
                        value={lockAmount}
                        decimals={6}
                        suffix="USDC"
                        displaySymbol={true}
                        className="whitespace-nowrap text-indigo-300 underline decoration-indigo-300 decoration-2 underline-offset-4"
                      />{" "}
                      {instantPreparation.isError &&
                        "(usually takes 3-5 business days)"}
                    </span>
                  }
                >
                  Unlock
                </TxButton>
              </div>
            </div>
            <div className="flex flex-col  gap-10 w-full">
              <div className="flex flex-col gap-2">
                <h3 className="font-bold text-3xl font-heading text-indigo-950/[75%]">
                  Your rewards
                </h3>
                <ul className="list-disc pl-6 leading-7">
                  <li>
                    Tokens:{" "}
                    <Amount
                      value={eligibleLDY}
                      decimals={18}
                      suffix="LDY"
                      displaySymbol={true}
                      className="font-bold"
                    />
                  </li>
                  <li>
                    Airdrop entries:{" "}
                    <span className="font-bold">
                      {eligibleEntries.toLocaleString()}{" "}
                      <i className="ri-coupon-2-fill" />
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-slate-300 text-lg font-medium p-4 rounded-xl text-center">
                $LDY rewards will be distributed simultaneously with the
                airdrop.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
