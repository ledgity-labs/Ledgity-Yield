"use client";
import React, { FC, useLayoutEffect, useRef } from "react";
import { Cube, Amount, Rate, Spinner } from "@/components/ui";
import { twMerge } from "tailwind-merge";
import Link from "next/link";

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

const HomeHero: FC<Props> = ({ className }) => {
  const heroSection = useRef<HTMLDivElement>(null);
  return (
    <section
      ref={heroSection}
      className={twMerge(
        "-mt-[97px] ",
        "before:absolute before:inset-0 before:bg-[url('/assets/textures/glow-light.webp')] before:bg-cover before:bg-[left_30%_bottom_0%] md:before:bg-center before:opacity-90",
        className,
      )}
    >
      <div className="relative flex min-h-[calc(100vh+3.5rem)] pb-14 -mb-14 pt-[calc(97px+15px)] flex-col items-center justify-center gap-[7vh] sm:gap-[5vh] lg:gap-[7.5vh]">
        <Cube size="tiny" className="right-12" />
        <Cube size="small" className="right-[17%] top-[45%] hidden 2xl:block" />
        <Cube size="small" className="right-14 top-[10%]" />
        <Cube size="tiny" className="bottom-12 left-44 block xl:hidden" />
        <Cube size="small" className="bottom-12 left-44 hidden xl:block" />
        <Cube size="small" className="bottom-[30%] left-80 hidden 2xl:block" />
        <Cube size="small" className="-left-16 bottom-[40%]" />
        <Cube
          size="medium"
          className="hidden sm:-right-0 sm:bottom-0 sm:block md:right-16  lg:bottom-[10%] lg:right-44"
        />
        <Cube size="medium" className="left-44 top-[10%] hidden lg:block" />
        <Cube
          size="tiny"
          className="-bottom-2 right-[35%] hidden lg:right-[47%] lg:block 2xl:right-[28%]"
        />
        <Cube size="small" className="-bottom-4 left-[30%] hidden 2xl:block" />

        <section className="flex flex-col items-center justify-center gap-[5vh]">
          <Link
            href="https://www.coingecko.com/en/coins/ledgity-token"
            target="_blank"
          >
            <div className="overflow flex scale-90 flex-col flex-wrap overflow-hidden rounded-3xl text-white opacity-100 drop-shadow-md backdrop-blur-md hover:opacity-80 sm:flex-row sm:flex-nowrap">
              <div className="flex items-center justify-center gap-1 whitespace-nowrap bg-gradient-to-bl from-[#20456c]/50 to-[purple] px-4 py-2 text-lg font-bold text-white">
                <i className="ri-fire-fill text-x animate-pulse" />
                <p>LDY Token</p>
              </div>
              <div className="flex items-center justify-center bg-gradient-to-bl from-[#20456c]/50 to-[red] gap-2 px-4 py-2 text-center text-lg font-semibold text-white md:px-3 md:py-1.5 ">
                Buy on MEXC or Uniswap
                <i className="ri-arrow-right-line text-xl font-bold text-orange-[#20456c]" />
              </div>
            </div>
          </Link>
          <h2 className="relative inline-flex flex-col text-center font-heading text-[14vw] font-bold leading-none text-slate-700 sm:block sm:text-[11.5vw] md:text-[11.5vw] lg:text-[7.2rem] xl:text-[7.8rem]">
            <span className="text-[15vw] drop-shadow-xl sm:[font-size:inherit]">
              Stable <span className="whitespace-nowrap">yield for</span>
            </span>
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-t from-indigo-400/30 to-indigo-500 bg-clip-text text-indigo-300 text-transparent drop-shadow-md">
              stablecoins<span className="text-slate-700">.</span>
            </span>
          </h2>
        </section>
        <div className="mt-14 flex w-screen flex-col items-center justify-center xl:mt-20">
          <div className="dark-neon min-w-[700px] sm:min-w-[1300px] md:min-w-[1300px] lg:min-w-[1800px]" />
          <ul className="flex items-center justify-center gap-24 px-14 lg:mt-2 lg:gap-32">
            <li className="text-center block">
              <span
                prefix="±"
                className="font-heading text-7xl font-extrabold text-slate-50/[60%] lg:text-7xl"
              >
                9%
              </span>
              <h3 className="font-heading text-xl font-bold text-primary opacity-70">
                APR
              </h3>
            </li>
          </ul>
        </div>
        <div>
          <i className="ri-arrow-down-double-fill text-3xl text-fg/50" />
        </div>
      </div>
    </section>
  );
};
export default HomeHero;
