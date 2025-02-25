// Wrapper
import {
  ERC20ApproveCheck,
  TxButtonWrapper,
  TxButtonWrapperProps,
} from "@/components/contracts/TxButtonWrapper";
// Button configs
import { ParamsStake, configStake } from "@/hooks/contracts";

// When the tx interacts with a contract without token dependencies
type TxButtonProps<T> = Omit<TxButtonWrapperProps, "buttonConfig"> & {
  params: T;
};

// When the tx interacts directly with a token
type TxTokenButtonProps<T> = Omit<TxButtonWrapperProps, "buttonConfig"> & {
  params: T;
  tokenAddress: string;
};

// When the tx depends on a token and might require approval
type TxButtonApproveProps<T> = Omit<TxButtonWrapperProps, "buttonConfig"> & {
  params: T;
  approveChecks: ERC20ApproveCheck[];
};

export const {
  // ====== Tokens ====== //
  StakeTx,
} = {
  // ====== Tokens ====== //
  StakeTx: (props: TxButtonApproveProps<ParamsStake>) => (
    <TxButtonWrapper
      {...props}
      buttonConfig={{
        ...configStake,
        makeInstance: () => configStake.makeInstance(),
      }}
    />
  ),
} as const;
