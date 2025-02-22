import {
  createContext,
  useState,
  ReactElement,
  useContext,
  useEffect,
} from "react";
// Context
import { useWeb3Context } from "./Web3ContextProvider";
// Hooks
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "../utils/useLocalStorage";
import { useTokenInfos } from "@/hooks/contracts/read/useTokenInfos";
import { useLTokenInfos } from "@/hooks/contracts/read/useLTokenInfos";
import { useTokenPricesUsd } from "@/hooks/api/useTokenPricesUsd";
// Functions
import { computeTvlMetrics, TvlMetrics } from "@/functions/helpers";
// Data
import { lTokenAddresses, dependenciesAddresses } from "@/data/addresses";
// Types
import { TokenInfo, LTokenInfo } from "@/types";

type AppDataContext = {
  referralCode: string;
  lTokenInfos: LTokenInfo[];
  lTokenInfosCurrentChain: LTokenInfo[];
  tvlMetrics: TvlMetrics;
  isLoadingPrices: boolean;
  tokenInfos: TokenInfo[];
};

const AppDataContext = createContext({} as AppDataContext);

export function AppDataContextProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const { currentAccount, appChainId } = useWeb3Context();

  // ==== Referral Code ==== //

  const searchParams = useSearchParams();

  const { localData: referralCode, setLocalData: setReferralCode } =
    useLocalStorage("referralCode", "");

  useEffect(() => {
    if (referralCode) return;

    if (searchParams.has("referral")) {
      const referralCode = searchParams.get("referral");
      if (!referralCode) return;

      setReferralCode(referralCode);
    }
  }, [searchParams]);

  // ==== Token Datas ==== //

  const ltokens = Object.keys(lTokenAddresses).flatMap((chainId) =>
    Object.values(lTokenAddresses[Number(chainId)]).map((address) => ({
      address,
      chainId: Number(chainId),
    })),
  );
  const lTokenInfos = useLTokenInfos(ltokens, currentAccount);
  const lTokenInfosCurrentChain = lTokenInfos.filter(
    (lToken) => lToken.chainId === appChainId,
  );
  const tokenInfos = useTokenInfos(
    Object.values(dependenciesAddresses[appChainId]),
  );

  // ==== Prices ==== //

  const underlyingSymbols = [
    ...new Set(lTokenInfos.map((lToken) => lToken.symbol.slice(1))),
  ];
  const tokenPrices = useTokenPricesUsd(underlyingSymbols);
  const isLoadingPrices = Object.keys(tokenPrices).length === 0;

  const tvlMetrics = computeTvlMetrics(lTokenInfos, tokenPrices);

  return (
    <AppDataContext.Provider
      value={{
        referralCode,
        lTokenInfos,
        lTokenInfosCurrentChain,
        tvlMetrics,
        isLoadingPrices,
        tokenInfos,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppDataContext = () => useContext(AppDataContext);
