"use client";
import { FC, useLayoutEffect, useRef } from "react";
import { Button, Card, Cube } from "@/components/ui";
import Link from "next/link";

const HomeFeatures: FC = () => {
  return (
    <section className="relative flex flex-col items-center justify-center">
      {/* <Cube size="medium" className="-top-8 left-64" /> */}
      <Cube size="large" className="-right-16 bottom-[35%]" />
      <Cube size="small" className="bottom-[15%] left-8" />

      <div className="flex max-w-[calc(24rem*3+3rem*3+2*2rem)] flex-wrap justify-center gap-12 px-8 pt-8">
        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            Long term stability
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/stability.svg')",
              WebkitMask: "url('/assets/features/stability.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            Benefit from stability of an institutional set up and a protocol
            backed by Real World Assets (RWA).
          </p>
        </Card>
        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            High efficiency
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/efficiency.svg')",
              WebkitMask: "url('/assets/features/efficiency.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            Our team of experts provide financial engineering to achieve the
            best risk-adjusted return from RWA.
          </p>
        </Card>
        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            Diversification
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/diversification.svg')",
              WebkitMask: "url('/assets/features/diversification.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            The collateralized portoflio of RWA is allocated accross hundreds of
            yield opportunities.
          </p>
        </Card>

        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            Multi-chains
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/multichains.svg')",
              WebkitMask: "url('/assets/features/multichains.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            The protocol aims to be available on most EVM chains to bring stable
            yield to every stablecoin holders.
          </p>
        </Card>
        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            No liquidation
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/no-liquidations.svg')",
              WebkitMask: "url('/assets/features/no-liquidations.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>{" "}
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            Our protocol does not implement any liquidation mechanism and fees
            at borrowing time.
          </p>
        </Card>
        <Card
          defaultGradient={true}
          circleIntensity={0.2}
          className="relative flex h-[360px] w-96 max-w-[95vw] flex-col items-center justify-between overflow-hidden"
        >
          <h3 className="absolute top-6 z-10 rounded-2xl bg-gradient-radial from-bg/50 to-transparent p-1 text-center font-heading text-2xl font-bold text-fg/80">
            Analytics
          </h3>
          <div
            className="card absolute h-full w-full bg-fg/30 bg-card-illustrations"
            style={{
              mask: "url('/assets/features/analytics.svg')",
              WebkitMask: "url('/assets/features/analytics.svg')",
              maskPosition: "top center",
              WebkitMaskPosition: "top center",
            }}
          ></div>
          <p className="absolute bottom-7 left-7 right-7 -mt-4 rounded-2xl bg-gradient-radial from-bg/50 to-transparent text-center text-[17px] font-medium text-fg/70">
            The app provides you with detailed charts and statistics about your
            investment and the protocol itself.
          </p>
        </Card>
      </div>

      <Link href="/app/invest">
        <Button
          size="large"
          className="relative hidden sm:block mt-12 overflow-visible"
        >
          Browse available yields
          <span className="absolute px-1 py-1 text-[0.71rem] leading-none rounded-md text-bg -top-0.5 -right-0.5 bg-orange-700">
            Beta
          </span>
        </Button>
      </Link>
    </section>
  );
};
export default HomeFeatures;
