import { Address, Amount, AmountInput, Button, Input } from "@/components/ui";
import { TxButton } from "@/components/ui/TxButton";
import { useContractAddress } from "@/hooks/useContractAddress";
import { useSimulateGenericErc20Mint } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import {
  createTestClient,
  erc20Abi,
  http,
  parseUnits,
  zeroAddress,
} from "viem";
import {
  UseSimulateContractReturnType,
  useAccount,
  useBlockNumber,
  useReadContract,
} from "wagmi";
import { hardhat } from "wagmi/chains";
import { AdminBrick } from "../AdminBrick";
import { AdminMasonry } from "../AdminMasonry";

const MintFakeToken: FC<{ contractName: string }> = ({
  contractName,
  ...props
}) => {
  const account = useAccount();
  const address = useContractAddress(contractName);
  const { data: tokenSymbol } = useReadContract({
    abi: erc20Abi,
    functionName: "symbol",
    address: address,
  });
  const { data: tokenName } = useReadContract({
    abi: erc20Abi,
    functionName: "name",
    address: address,
  });
  const { data: tokenDecimals } = useReadContract({
    abi: erc20Abi,
    functionName: "decimals",
    address: address,
  });
  const { data: tokenBalance, queryKey } = useReadContract({
    abi: erc20Abi,
    functionName: "balanceOf",
    address: address,
    args: [account.address || zeroAddress],
  });
  const [mintedAmount, setMintedAmount] = useState(0n);
  const preparation = useSimulateGenericErc20Mint({
    address: address,
    args: [mintedAmount],
  });

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
    <div {...props} className="mt-8">
      <h4 className="text-lg font-semibold">{tokenName}</h4>
      <ul className="pl-4 flex flex-col gap-2 py-2 list-disc">
        <li className="flex gap-3 items-center">
          <h5 className="font-bold text-fg/60">Address</h5>
          <Address
            address={address}
            copyable={true}
            addToWallet={true}
            tooltip={true}
          />
        </li>
        <li className="flex gap-3 items-center">
          <h5 className="font-bold text-fg/60">Symbol</h5>
          <span>{tokenSymbol}</span>
        </li>
        <li className="flex gap-3 items-center">
          <h5 className="font-bold text-fg/60">Decimals</h5>
          <span>{tokenDecimals}</span>
        </li>
        <li className="flex gap-3 items-center">
          <h5 className="font-bold text-fg/60">Your balance</h5>
          <span>
            {tokenBalance && tokenDecimals ? (
              <Amount value={tokenBalance} decimals={tokenDecimals} />
            ) : (
              0
            )}
          </span>
        </li>
        <li className="flex flex-col">
          <h5 className="font-bold text-fg/60">Mint</h5>
          <div className="flex justify-end items-end gap-4">
            <AmountInput
              maxName="Max"
              maxValue={parseUnits("9999999", tokenDecimals!)}
              decimals={tokenDecimals}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMintedAmount(parseUnits(e.target.value, tokenDecimals!))
              }
            />
            <TxButton size="medium" preparation={memoizedPreparation}>
              Mint
            </TxButton>
          </div>
        </li>
      </ul>
    </div>
  );
};
export const AdminTesting: FC = () => {
  const [dayForwards, setDayForwards] = useState(0);

  const testClient = createTestClient({
    chain: hardhat,
    mode: "hardhat",
    transport: http(),
  });

  return (
    <AdminMasonry>
      <AdminBrick title="Underlying tokens">
        <p>
          When Ledgity Yield is deployed locally, fake stablecoins contracts are
          also automatically deployed to mimic mainnets&apos; ones.
          <br />
          <br />
          Here are those for the current local network:
        </p>
        {/* {lTokens.map((lToken) => (
          <MintFakeToken key={lToken} contractName={lToken.slice(1)} />
        ))} */}
      </AdminBrick>
      <AdminBrick title="LDY token">
        <p>
          When Ledgity Yield is deployed locally, a fake $LDY token contract is
          also automatically deployed to mimic the mainnets&apos; ones.
          <br />
          <br />
          Here is the one for the local test network:
        </p>
        <MintFakeToken contractName="LDY" />
      </AdminBrick>
      <AdminBrick title="Increase block time">
        <div className="flex flex-col justify-center items-center gap-3">
          <p>
            Warning: When local chain timestamp is moved forward, the JS
            `Date.now()` is still at current timestamp. This may produce
            unwanted results if on-chain timestamps are for example compared to
            JS ones.
          </p>
          <Input
            type="number"
            placeholder="Number of days"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setDayForwards(Number(e.target.value))
            }
          />
          <Button
            onClick={() =>
              testClient.increaseTime({ seconds: dayForwards * 24 * 60 * 60 })
            }
          >
            Increase time
          </Button>
        </div>
      </AdminBrick>
      <AdminBrick title="Mint block">
        <Button
          onClick={() =>
            testClient.mine({
              blocks: 1,
            })
          }
        >
          Mint one block
        </Button>
      </AdminBrick>
    </AdminMasonry>
  );
};
