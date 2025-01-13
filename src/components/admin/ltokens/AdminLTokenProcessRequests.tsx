import { Card, TxButton } from "@/components/ui";
import { useSimulateLTokenProcessQueuedRequests } from "@/generated";
import { useContractAddress } from "@/hooks/useContractAddress";
import { FC, useMemo } from "react";
import { AdminBrick } from "../AdminBrick";
import { UseSimulateContractReturnType } from "wagmi";

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

export const AdminLTokenProcessRequests: FC<Props> = ({ lTokenSymbol }) => {
  const lTokenAddress = useContractAddress(lTokenSymbol);
  const preparation = useSimulateLTokenProcessQueuedRequests({
    address: lTokenAddress,
  });

  const memoizedPreparation = useMemo(() => {
    return preparation as unknown as UseSimulateContractReturnType;
  }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  return (
    <AdminBrick title="Process withdrawal requests">
      <div className="flex justify-center items-center">
        <TxButton preparation={memoizedPreparation} size="medium">
          Process
        </TxButton>
      </div>
    </AdminBrick>
  );
};
