"use client";

import { AppInvestTokens } from "./AppInvestTokens";
import { Card } from "@/components/ui";
import Link from "next/link";
import { useAppDataContext } from "@/hooks/context/AppDataContextProvider";
import { Spinner } from "@/components/ui/Spinner";

export function AppInvest() {
  const { tvlMetrics, isLoadingPrices } = useAppDataContext();

  return (
    <div className="lg:w-[980px] w-full flex flex-col gap-8 pb-8">
      <Card
        defaultGradient={true}
        circleIntensity={0.07}
        className="w-full flex flex-col gap-10 relative overflow-hidden"
      >
        <span className="absolute px-2 py-1.5 pt-1 text-sm leading-none rounded-bl-lg rounded-br-lg text-bg top-0 left-5 bg-orange-700 font-medium drop-shadow-md">
          Beta
        </span>
        <div className="flex sm:gap-10 gap-6 justify-between flex-wrap-reverse sm:p-10 p-5 pt-8 pb-0">
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg text-fg/50">TVL</h3>
            <div className="text-[1.92rem] text-fg font-heading font-bold">
              {isLoadingPrices ? (
                <Spinner />
              ) : (
                "$" + tvlMetrics.total.toLocaleString()
              )}
            </div>
          </div>
          <div className="flex sm:gap-14 gap-10 flex-wrap">
            <div className="flex flex-col md:items-end items-start gap-2">
              <h3 className="font-bold text-lg text-fg/50 whitespace-nowrap">
                Holders
              </h3>
              <div className="text-[1.92rem] text-fg/90 font-heading font-bold">
                1,784
              </div>
            </div>
          </div>
        </div>
        <p className="sm:px-10 px-5 font-medium text-lg lg:w-[60%] md:w-[65%] sm:w-[80%] w-full text-fg/80 -mt-3">
          Invest USDC and get exposed to real, stable and high-efficiency yield
          backed by RWA (Real World Assets).
          <br />
          <Link
            href="https://docs.ledgity.finance/"
            target="_blank"
            className="text-fg/95 font-semibold underline underline-offset-2 decoration-fg/20 hover:text-slate-900 transition-colors"
          >
            Read the{" "}
            <span className="whitespace-nowrap">
              documentation <i className="ri-arrow-right-line" />
            </span>
          </Link>
        </p>
        <AppInvestTokens />
        <p className="text-center pb-5 -mt-5 opacity-60 font-medium text-[0.85rem] px-5">
          By depositing you agree to our{" "}
          <Link
            href="/legal/terms-and-conditions"
            className="text-indigo-700 underline underline-offset-2 decoration-primary/40"
          >
            Terms & Conditions.
          </Link>
        </p>
      </Card>
    </div>
  );
}
