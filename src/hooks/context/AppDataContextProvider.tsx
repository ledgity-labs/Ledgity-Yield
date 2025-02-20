import React, {
  createContext,
  useState,
  ReactElement,
  useContext,
  useEffect,
} from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "../utils/useLocalStorage";

type AppDataContext = {
  referralCode: string;
};

const AppDataContext = createContext({} as AppDataContext);

export function AppDataContextProvider({
  children,
}: {
  children: ReactElement;
}): ReactElement {
  const searchParams = useSearchParams();

  const [referralCode, setReferralCode] = useLocalStorage("referralCode", "");

  useEffect(() => {
    if (referralCode) return;

    if (searchParams.has("referral")) {
      const referralCode = searchParams.get("referral");
      if (!referralCode) return;

      setReferralCode(referralCode);
    }
  }, [searchParams]);

  return (
    <AppDataContext.Provider
      value={{
        referralCode,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppDataContext = () => useContext(AppDataContext);
