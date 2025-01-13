import { Card, Rate, TxButton } from "@/components/ui";
import { RateInput } from "@/components/ui/RateInput";
import {
  useReadLTokenFeesRateUd7x3,
  useSimulateLTokenSetFeesRate,
} from "@/generated";
import { useContractAddress } from "@/hooks/useContractAddress";
import { ChangeEvent, FC, useEffect, useState, useMemo } from "react";
import { parseUnits } from "viem";
import { AdminBrick } from "../AdminBrick";
import { useQueryClient } from "@tanstack/react-query";
import { UseSimulateContractReturnType, useBlockNumber } from "wagmi";

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

export const AdminLTokenFeesRate: FC<Props> = ({ className, lTokenSymbol }) => {
  const underlyingTokenName = lTokenSymbol.slice(1);
  const lTokenAddress = useContractAddress(lTokenSymbol);
  const { data: feesRate, queryKey } = useReadLTokenFeesRateUd7x3({
    address: lTokenAddress,
  });
  const [newFeesRate, setNewFeesRate] = useState(0);
  const preparation = useSimulateLTokenSetFeesRate({
    address: lTokenAddress,
    args: [newFeesRate],
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

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
    <AdminBrick title="Fees rate">
      <p>
        This rate corresponds to the % of fees charged to eligible{" "}
        {underlyingTokenName} withdrawal requests.
      </p>
      <p>
        Current value: <Rate value={feesRate} className="font-bold" />
      </p>
      <div className="flex justify-center items-end gap-3">
        <RateInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setNewFeesRate(Number(parseUnits(e.target.value, 3)));
            if (hasUserInteracted === false) setHasUserInteracted(true);
            if (e.target.value === "") setHasUserInteracted(false);
          }}
        />

        <TxButton
          preparation={memoizedPreparation}
          hasUserInteracted={hasUserInteracted}
          size="medium"
        >
          Set
        </TxButton>
      </div>
    </AdminBrick>
  );
};
