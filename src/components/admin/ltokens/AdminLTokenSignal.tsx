import { Card, TxButton } from "@/components/ui";
import { useSimulateLTokenSignalerSignalLToken } from "@/types";
import { useContractAddress } from "@/hooks/useContractAddress";
import { FC, useMemo } from "react";
import { AdminBrick } from "../AdminBrick";
import { UseSimulateContractReturnType } from "wagmi";

interface Props extends React.ComponentPropsWithRef<typeof Card> {
  lTokenSymbol: string;
}

export const AdminLTokenSignal: FC<Props> = ({ lTokenSymbol }) => {
  const lTokenAddress = useContractAddress(lTokenSymbol);
  const preparation = useSimulateLTokenSignalerSignalLToken({
    args: [lTokenAddress!],
  });

  const memoizedPreparation = useMemo(() => {
    return preparation as unknown as UseSimulateContractReturnType;
  }, [preparation.data?.request, preparation.error, preparation.isLoading]);

  return (
    <AdminBrick title="Data indexing">
      <div className="flex justify-center items-center">
        <TxButton preparation={memoizedPreparation} size="medium">
          Signal
        </TxButton>
      </div>
    </AdminBrick>
  );
};
