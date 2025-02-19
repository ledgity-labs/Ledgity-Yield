import { MetadataRoute } from "next";

const fqdn = "https://ledgity.finance";
const pages = [
  "/",
  "/legal/privacy-policy",
  "/legal/terms-and-conditions",
  "/app/invest",
  "/app/staking",
  "/app/pre-mining",
  "/app/dashboard",
  "/app/get-usdc",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date();

  return pages.map((page) => ({
    url: `${fqdn}${page}`,
    lastModified: lastMod,
  }));
}
