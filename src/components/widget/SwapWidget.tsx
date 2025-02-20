import dynamic from "next/dynamic";

const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  { ssr: false }, // Ensures it loads only in the browser
);

const widgetConfig = {
  theme: {
    container: {
      border: "1px solid rgb(234, 234, 234)",
      borderRadius: "16px",
    },
  },
};

export const SwapWidget = () => {
  return <LiFiWidget integrator="Ledgity" config={widgetConfig} />;
};
