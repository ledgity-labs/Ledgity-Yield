"use client";

import Logo from "@/components/ui/Logo";
import { ConnectButton } from "@/components/app/ConnectButton";
import { DotsMenu } from "../DotsMenu";
import Link from "next/link";
import { Button } from "../ui";
import { usePathname } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function Header() {
  const pathname = usePathname();
  const isAppOrAdmin =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  return (
    <header className="relative z-50 pb-[97px]">
      <nav className="fixed flex w-screen items-center justify-between px-6 py-6 backdrop-blur-md">
        <Logo className={twMerge("ml-2", isAppOrAdmin && "hidden md:flex")} />
        <Logo
          className={twMerge("ml-2 hidden", isAppOrAdmin && "flex md:hidden")}
          noText={true}
        />

        <div className="flex sm:gap-6 gap-3 justify-end">
          {isAppOrAdmin ? (
            <ConnectButton />
          ) : (
            <Link href="/app/invest">
              <Button
                size="large"
                className="relative hidden sm:block overflow-visible"
              >
                Enter app
                <span className="absolute px-1 py-1 text-[0.71rem] leading-none rounded-md text-bg -top-0.5 -right-0.5 bg-orange-700">
                  Beta
                </span>
              </Button>
            </Link>
          )}
          <DotsMenu />
        </div>
      </nav>
    </header>
  );
}
