import { Card, Rate, TxButton } from "@/components/ui";
import { RateInput } from "@/components/ui/RateInput";
import {
  useReadLTokenRetentionRateUd7x3,
  useSimulateLTokenSetRetentionRate,
} from "@/generated";
import { useContractAddress } from "@/hooks/useContractAddress";
import { ChangeEvent, FC, useEffect, useState, useMemo } from "react";
import { parseUnits } from "viem";
import { AdminBrick } from "../AdminBrick";
import { UseSimulateContractReturnType, useBlockNumber } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

export const AdminLTokenRetentionRate: FC<Props> = ({
  className,
  lTokenSymbol,
}) => {
  const underlyingTokenName = lTokenSymbol.slice(1);
  const lTokenAddress = useContractAddress(lTokenSymbol);
  const { data: retentionRate, queryKey } = useReadLTokenRetentionRateUd7x3({
    address: lTokenAddress,
  });
  const [newRetentionRate, setNewRetentionRate] = useState(0);
  const preparation = useSimulateLTokenSetRetentionRate({
    address: lTokenAddress,
    args: [newRetentionRate],
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
    <AdminBrick title="Retention rate">
      <p>
        This rate corresponds to the target and maximal amount of{" "}
        {underlyingTokenName} to retain on the contract.
      </p>
      <p>
        Current value: <Rate value={retentionRate} className="font-bold" />
      </p>
      <div className="flex justify-center items-end gap-3">
        <RateInput
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setNewRetentionRate(Number(parseUnits(e.target.value, 3)));
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
