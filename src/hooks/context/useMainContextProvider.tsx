import React, { createContext, useState, useContext } from "react";

type MainContext = {
  referralCode: string | null;
  changeReferalCode: (slug: string | null) => void;
  currentTab: string;
  switchTab: (slug: string) => void;
};

const MainContext = createContext({} as MainContext);

export const MainContextProvider: React.FC<{
  children: React.ReactElement;
}> = ({ children }) => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  function changeReferalCode(slug: string | null) {
    setReferralCode(slug);
  }

  const [currentTab, setCurrentTab] = useState("invest");

  const switchTab = (slug: string) => {
    history.pushState({}, slug, `/app/${slug}`);
    setCurrentTab(slug);
  };

  return (
    <MainContext.Provider
      value={{
        referralCode,
        changeReferalCode,
        currentTab,
        switchTab,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};

export const useMainContext = () => useContext(MainContext);
