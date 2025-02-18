import "@/styles/globals.css";
import "remixicon/fonts/remixicon.css";
import "@rainbow-me/rainbowkit/styles.css";

import { type NextPage } from "next";
import { CardsHelper, TooltipProvider } from "@/components/ui";
import { fonts } from "@/lib/fonts";
import clsx from "clsx";
import dynamic from "next/dynamic";
import Loader from "@/app/loading";
import Header from "@/components/Header";
import Script from "next/script";
import { Toaster } from "@/components/ui/Toaster";
// import DApp from "@/components/DApp";
import App from "../components/App";

const name = "Ledgity Yield";
const description =
  "Ledgity Yield provides stablecoins holders with a real, stable and high-efficiency yield backed by Real World Assets (RWA) 💫";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "light",
  themeColor: "rgb(var(--bg))",
};

export const metadata = {
  metadataBase: new URL("https://ledgity.finance"),
  applicationName: name,
  title: {
    template: `${name} • %s`,
    default: "Untitled Page",
  },
  description: description,
  keywords: [
    "stablecoins",
    "yield",
    "DeFi",
    "crypto",
    "RWA",
    "real world assets",
    "CeFi",
    "stable yield for stable coin",
    "ledgity",
    "ledgity.com",
  ],

  openGraph: {
    title: `${name} | Stable Yield For Stablecoins`,
    description: description,
    siteName: name,
    locale: "en_US",
    type: "website",
    url: "https://ledgity.finance",
  },
  twitter: {
    card: "summary_large_image",
    site: "@LedgityYield",
    creator: "@LedgityYield",
    title: `${name} | Stable Yield For Stablecoins`,
    description: description,
  },
  manifest: "https://ledgity.finance/manifest.json",
  verification: {
    google: "Gy_ommY7mtAUwTSdS8bNsHmmMeeKSmPAy8H5lEhX738",
  },
};

interface Props {
  children: React.ReactNode;
}

const RootLayout: NextPage<Props> = ({ children }) => {
  // Force DApp to be loaded dynamically without SSR
  // const App = dynamic(() => import("@/components/App"), {
  //   loading: Loader,
  //   ssr: false,
  // });

  return (
    <html lang="en">
      <body
        className={clsx(
          fonts,
          "min-h-screen",
          "after:pointer-events-none after:absolute after:inset-0 after:z-[1000000] after:bg-[url(/assets/textures/noise.png)] after:opacity-[0.02] after:bg-blend-difference after:contrast-200",
          "before:absolute before:inset-0 before:bg-[url('/assets/textures/other-glow.webp')] before:bg-cover before:opacity-50",
        )}
      >
        <CardsHelper />
        <TooltipProvider delayDuration={400}>
          <App>
            <div className="max-w-screen relative overflow-x-hidden overflow-y-hidden">
              <Header />
              <main>
                {children}
                <Toaster />
              </main>
            </div>
          </App>
        </TooltipProvider>

        {/* Google tag (gtag.js) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-90LEKEYYXG" />
        <Script id="google-analytics">
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', 'G-90LEKEYYXG');
        `}
        </Script>
        <Script>
          {`var script=document.createElement('script');script.src="https://tag.safary.club/stag-0.1.16.js";script.async=true;script.setAttribute('data-name','safary-sdk');script.setAttribute('data-product-id','prd_TWojQkILET');script.integrity="sha256-jl67N5KgpOXS3tLPc6pUXU1UxJqBm9LUZtqX5H3jZ2U=";script.crossOrigin="anonymous";var target=document.head||document.body;target.appendChild(script);`}
        </Script>
      </body>
    </html>
  );
};

export default RootLayout;
