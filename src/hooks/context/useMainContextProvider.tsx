import React, { createContext, useState, useContext, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useLocalStorage } from "../utils/useLocalStorage";

type MainContext = {
  referralCode: string;
};

const MainContext = createContext({} as MainContext);

export const MainContextProvider: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
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
    <MainContext.Provider
      value={{
        referralCode,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
