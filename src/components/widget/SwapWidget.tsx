import { LiFiWidget, WidgetConfig } from "@lifi/widget";

const widgetConfig: Omit<WidgetConfig, "integrator"> = {
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
