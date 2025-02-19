"use client";
import { FC, useLayoutEffect, useRef } from "react";
import {
  Button,
  Card,
  Cube,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui";
import Link from "next/link";

const HomeHowItWorks: FC = () => {
  return (
    <section className="relative  my-56 flex flex-col items-center justify-center">
      <Cube size="small" className="bottom-[55%] right-36" />
      <Cube size="medium" className="left-36 top-[55%]" />

      <h3 className="pb-[4.5rem] text-center font-heading text-4xl font-bold text-fg/90">
        How it works?
      </h3>
      <ol className="flex flex-wrap items-center justify-center gap-12 px-12">
        <li className="flex flex-col justify-center">
          <Card defaultGradient={true} className="relative w-[250px] py-5">
            <div className="absolute -left-3 -top-3">
              <Card
                radius="full"
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-primary/75"
              >
                <span className="font-bold text-primary-fg">1</span>
              </Card>
            </div>
            <p className="w-full text-center text-xl font-medium text-fg/90">
              Deposit stablecoins
            </p>
          </Card>
          <p className="-ml-2 inline-flex h-full items-center justify-center pt-4 text-[1rem] font-medium tracking-wide text-fg/50">
            USDC, EUROC, and more!
          </p>
        </li>
        <li className="flex flex-col justify-center">
          <Card defaultGradient={true} className="relative w-[250px] py-5">
            <div className="absolute -left-2 -top-3">
              <Card
                radius="full"
                className="flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-primary/75"
              >
                <span className="font-bold text-primary-fg">2</span>
              </Card>
            </div>
            <p className="w-full text-center text-xl font-medium text-fg/90">
              Receive L-Tokens
            </p>
          </Card>
          <p className="-ml-2 inline-flex h-full items-center justify-center pt-4 text-[1rem] font-medium tracking-wide text-fg/50">
            Example: LUSDC for USDC
          </p>
        </li>
        <li className="flex flex-col justify-center">
          <Card defaultGradient={true} className="relative w-[250px] py-5">
            <div className="absolute -left-2 -top-3">
              <Card
                radius="full"
                className=" flex h-10 w-10 items-center justify-center rounded-full text-xl before:bg-primary/75"
              >
                <span className="font-bold text-primary-fg">3</span>
              </Card>
            </div>
            <p className="w-full text-center text-xl font-medium text-fg/90">
              Enjoy stable yield !
            </p>
          </Card>
          <p className="-ml-2 inline-flex h-full items-center justify-center pt-4 text-[1rem] font-medium tracking-wide text-fg/50">
            Backed by RWA
          </p>
        </li>
      </ol>
      <div className="mx-10 mt-24 flex flex-wrap items-center justify-center gap-8 rounded-3xl bg-primary/10 p-14 backdrop-blur-xl ">
        <p className="whitespace-nowrap text-center text-xl font-semibold text-fg/90 underline decoration-primary/30 decoration-[3px]">
          Want to learn more?
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="https://docs.ledgity.finance/" target="_blank">
            <Button
              variant="outline"
              size="medium"
              className="flex items-center justify-center gap-2"
            >
              <i className="ri-book-2-fill text-xl text-primary/80"></i>
              Browse documentation
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default HomeHowItWorks;
