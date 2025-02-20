import { FC, HTMLAttributes } from "react";
import Link from "next/link";
import Logo from "../ui/Logo";
import { twMerge } from "tailwind-merge";

const legalLinks = [
  { name: "Terms & Conditions", url: "/legal/terms-and-conditions" },
  { name: "Privacy Policy", url: "/legal/privacy-policy" },
  { name: "Documentation", url: "https://docs.ledgity.finance/" },
];

const socialData = [
  {
    name: "Twitter",
    icon: "twitter-x-fill",
    link: "https://twitter.com/LedgityYield",
  },
  {
    name: "Discord",
    icon: "discord-fill",
    link: "https://discord.gg/ledgityyield",
  },
  {
    name: "Telegram",
    icon: "telegram-fill",
    link: "https://t.me/ledgityapp",
  },
  {
    name: "Github",
    icon: "github-fill",
    link: "https://github.com/LedgityLabs/LedgityYield",
  },
  {
    name: "Email",
    icon: "mail-fill",
    link: "mailto:contact@ledgity.finance",
  },
  {
    name: "Gitbook",
    icon: "book-2-fill",
    link: "https://docs.ledgity.finance/",
  },
];

export function Footer({ className }: { className?: string }) {
  return (
    <footer
      className={twMerge(
        "relative flex flex-col items-center justify-center gap-10 overflow-hidden bg-fg p-16",
        className,
      )}
    >
      <section className="grid w-full grid-cols-1 grid-rows-1 gap-12 lg:grid-cols-3 lg:gap-0 ">
        <article className="row-start-3 flex items-center justify-center text-bg lg:row-start-1">
          <ul className="flex flex-col gap-2">
            {legalLinks.map(({ name, url }) => (
              <li
                key={name}
                className="font-semibold text-bg/70 underline transition hover:text-bg/90"
              >
                <Link href={url} className="whitespace-nowrap">
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </article>

        <article className="flex items-center justify-center">
          <Logo theme="dark" />
        </article>

        <article className="flex items-center justify-center lg:justify-end">
          <ul className="flex items-center justify-center gap-7">
            {socialData.map(({ name, icon, link }) => (
              <li key={name} className="flex items-center justify-center">
                <Link
                  aria-label={name}
                  href={link}
                  target="_blank"
                  className="inline-block w-8"
                >
                  <i
                    className={`ri-${icon} inline-block text-4xl text-bg transition-[transform,fill] hover:scale-110 hover:text-accent`}
                  ></i>
                </Link>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </footer>
  );
}
