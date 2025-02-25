import { AllowanceTxButton, Card, Input, TxButton } from "@/components/ui";
import {
  useReadLTokenUnderlying,
  useReadLTokenWithdrawalQueue,
  useSimulateLTokenProcessBigQueuedRequest,
} from "@/types";
import { ChangeEvent, FC, useState, useMemo } from "react";
import { AdminBrick } from "../AdminBrick";
import { getContractAddress } from "@/functions/getContractAddress";
import { UseSimulateContractReturnType } from "wagmi";

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

export const AdminLTokenProcessBigQueued: FC<Props> = ({ lTokenSymbol }) => {
  const lTokenAddress = getContractAddress(lTokenSymbol);
  const { data: underlyingAddress } = useReadLTokenUnderlying({
    address: lTokenAddress!,
  });
  const [requestId, setRequestId] = useState(0n);
  const preparation = useSimulateLTokenProcessBigQueuedRequest({
    address: lTokenAddress,
    args: [requestId],
  });
  const { data: requestData } = useReadLTokenWithdrawalQueue({
    address: lTokenAddress,
    args: [requestId],
  });
  const requestAmount = requestData ? requestData[1] : 0n;
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  const memoizedPreparation = useMemo(() => {
    return preparation as unknown as UseSimulateContractReturnType;
  }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  return (
    <AdminBrick title="Process big queued request">
      <p>
        This utility can only be called by the fund wallet and will process a
        given request using the fund&apos;s {lTokenSymbol.slice(1)} balance
        directly.
      </p>
      <div className="flex justify-center items-end gap-3">
        <Input
          type="number"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setRequestId(BigInt(e.target.value));
            if (hasUserInteracted === false) setHasUserInteracted(true);
            if (e.target.value === "") setHasUserInteracted(false);
          }}
          placeholder="Request ID"
          step={1}
        />
        <AllowanceTxButton
          preparation={memoizedPreparation}
          hasUserInteracted={hasUserInteracted}
          token={underlyingAddress!}
          spender={lTokenAddress!}
          amount={requestAmount}
          size="medium"
        >
          Process
        </AllowanceTxButton>
      </div>
    </AdminBrick>
  );
};
