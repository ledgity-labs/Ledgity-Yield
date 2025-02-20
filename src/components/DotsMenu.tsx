"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { FC, useEffect, useRef, useState } from "react";
import { Button, Card } from "./ui";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { NetworkStatus } from "./app/NetworkStatus";
import packageJSON from "../../package.json";
import { usePathname } from "next/navigation";

interface Props extends React.HTMLAttributes<HTMLButtonElement> {}

export const DotsMenu: FC<Props> = ({ className }) => {
  const pathname = usePathname();
  const [adminKeyPressCount, setAdminKeyPressCount] = useState(0);
  const [isAdminVisible, setIsAdminVisible] = useState(false);
  const isAppOrAdmin =
    pathname.startsWith("/app") || pathname.startsWith("/admin");

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isAdminVisible) {
      if (event.key === "Control" || event.key === "Meta") {
        const newPressCount = adminKeyPressCount + 1;
        if (newPressCount < 10) setAdminKeyPressCount(newPressCount);
        else {
          setAdminKeyPressCount(0);
          setIsAdminVisible(true);
          setTimeout(() => {
            setIsAdminVisible(false);
          }, 3000);
        }
      }
    }
  };

  // Listen to keydown events and increment the counter
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAdminVisible, adminKeyPressCount]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={twMerge(
            "flex w-12 items-center justify-center font-bold",
            className,
          )}
          variant="outline"
        >
          <i className="ri-more-2-fill text-2xl "></i>
        </Button>
      </PopoverTrigger>
      <PopoverContent collisionPadding={20} sideOffset={10}>
        <Card className="flex flex-col gap-14 sm:p-10 p-8 pb-8 drop-shadow-lg">
          <ul className="flex flex-col gap-3 text-lg font-semibold">
            <li className="sm:hidden">
              <Link
                href="/app/invest"
                className="font-bold text-primary hover:opacity-80"
              >
                Enter app
              </Link>
            </li>
            <li>
              <Link
                href="https://docs.ledgity.finance/"
                target="_blank"
                className="hover:opacity-80"
              >
                Documentation&nbsp;
                <i className="ri-external-link-fill" />
              </Link>
            </li>

            <li>
              <Link
                href="https://discord.gg/ledgityyield"
                target="_blank"
                className="hover:opacity-80"
              >
                Support&nbsp;
                <i className="ri-external-link-fill" />
              </Link>
            </li>
            {isAdminVisible && (
              <li>
                <Link href="/admin" className="text-primary hover:opacity-80">
                  Administration
                </Link>
              </li>
            )}
          </ul>
          <div>
            <div className="flex items-end justify-between">
              {(isAppOrAdmin && <NetworkStatus />) || <div></div>}
              <p className="text-center text-sm">
                <span className="text-center text-fg/70">Version</span>&nbsp;
                <br />
                <span className="text-center text-base font-semibold text-fg/90">
                  {packageJSON.version}
                </span>
              </p>
            </div>
            <hr className="mb-5 mt-4 border-fg/20" />
            <ul className="flex items-center justify-center flex-wrap gap-7">
              <li className="flex items-center justify-center">
                <Link
                  aria-label="Twitter"
                  href="https://twitter.com/LedgityYield"
                  target="_blank"
                  className="inline-block h-8 w-8"
                >
                  <i className="ri-twitter-x-fill inline-block text-3xl transition-[transform,fill] hover:scale-105 hover:opacity-80"></i>
                </Link>
              </li>
              <li className="flex items-center justify-center">
                <Link
                  aria-label="Discord"
                  href="https://discord.gg/ledgityyield"
                  target="_blank"
                  className="inline-block h-8 w-8"
                >
                  <i className="ri-discord-fill inline-block text-3xl transition-[transform,fill] hover:scale-105 hover:opacity-80"></i>
                </Link>
              </li>
              <li className="flex items-center justify-center">
                <Link
                  aria-label="Telegram"
                  href="https://t.me/ledgityapp"
                  target="_blank"
                  className="inline-block h-8 w-8"
                >
                  <i className="ri-telegram-fill inline-block text-3xl transition-[transform,fill] hover:scale-105 hover:opacity-80"></i>
                </Link>
              </li>
              <li className="flex items-center justify-center">
                <Link
                  aria-label="Github"
                  href="https://github.com/LedgityLabs/LedgityYield"
                  target="_blank"
                  className="inline-block h-8 w-8"
                >
                  <i className="ri-github-fill inline-block text-3xl transition-[transform,fill] hover:scale-105 hover:opacity-80"></i>
                </Link>
              </li>
              <li className="flex items-center justify-center">
                <Link
                  aria-label="Email"
                  href="mailto:contact@ledgity.finance"
                  target="_blank"
                  className="inline-block h-8 w-8"
                >
                  <i className="ri-mail-fill inline-block text-3xl transition-[transform,fill] hover:scale-105 hover:opacity-80"></i>
                </Link>
              </li>
            </ul>
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
