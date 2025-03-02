// This ensure env vars are validated at build-time
// See: https://env.t3.gg/docs/nextjs
import "./env.mjs";
import bundleAnalyser from "next-bundle-analyzer";

/** @type {import("next").NextConfig} */
const nextConfig = bundleAnalyser({
  enabled: process.env.ANALYZE === "true",
})({
  typescript: {
    tsconfigPath: "./src/tsconfig.json",
  },
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // typedRoutes: true, // Enable internal link type-checking (see: https://nextjs.org/docs/pages/building-your-application/configuring/typescript#statically-typed-links)
  },
  // Require by Wagmi work in Next.js client components
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map"; // This is more reliable than 'source-map'
    }
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.optimization.splitChunks = {
      chunks: "all",
      maxInitialRequests: 25,
      minSize: 50 * 1024,
    };

    // config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  images: {
    remotePatterns: [
      // Required to load ENS avatars
      {
        protocol: "https",
        hostname: "euc.li",
        port: "",
      },
      // Required to load Twitter profile pics
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/app/invest",
        permanent: true,
      },
    ];
  },
});
export default nextConfig;
