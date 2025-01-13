import { FC, useEffect, useMemo } from "react";
import { AdminMasonry } from "../AdminMasonry";
import { AdminBrick } from "../AdminBrick";
import { AdminAddressSetter } from "../AdminAddressSetter";
import {
  useReadGlobalOwnerPendingOwner,
  useSimulateGlobalOwnerAcceptOwnership,
} from "@/generated";
import {
  UseSimulateContractReturnType,
  useAccount,
  useBlockNumber,
} from "wagmi";
import { TxButton } from "@/components/ui";
import { useQueryClient } from "@tanstack/react-query";

export const AdminOwnership: FC = () => {
  const account = useAccount();
  const { data: pendingOwner, queryKey } = useReadGlobalOwnerPendingOwner({});
  const preparation = useSimulateGlobalOwnerAcceptOwnership();

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
    <AdminMasonry className="!columns-2 w-[900px]">
      <AdminBrick title="Transfer global ownership">
        <AdminAddressSetter
          contractName="GlobalOwner"
          getterFunctionName="owner"
          setterFunctionName="transferOwnership"
          txButtonName="Transfer"
        />
      </AdminBrick>
      <AdminBrick title="Receive global ownership" className="items-center">
        {pendingOwner && account.address === pendingOwner ? (
          <>
            <p className="text-center">
              The connected wallet is the recipient of a pending transfer
            </p>
            <TxButton preparation={memoizedPreparation} size="medium">
              Accept
            </TxButton>
          </>
        ) : (
          <p className="text-center">
            It seems that no transfer is pending or that the connected wallet is
            not the recipient.
          </p>
        )}
      </AdminBrick>
    </AdminMasonry>
  );
};
