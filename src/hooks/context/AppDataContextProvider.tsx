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
// Data
import { lTokenAddresses, dependenciesAddresses } from "@/data/addresses";
// Types
import { TokenInfo, LTokenInfo } from "@/types";

type AppDataContext = {
  referralCode: string;
  lTokenInfos: LTokenInfo[];
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

  const lTokenInfos = useLTokenInfos(
    Object.values(lTokenAddresses[appChainId]),
    currentAccount,
  );
  const tokenInfos = useTokenInfos(
    Object.values(dependenciesAddresses[appChainId]),
  );

  return (
    <AppDataContext.Provider
      value={{
        referralCode,
        lTokenInfos,
        tokenInfos,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppDataContext = () => useContext(AppDataContext);
