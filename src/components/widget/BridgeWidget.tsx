import dynamic from "next/dynamic";

const TxWidget = dynamic(
  () => import("@xswap-link/sdk").then((mod) => mod.TxWidget),
  { ssr: false }, // Ensures it loads only in the browser
);

const srcChain = "42161";
const dstChain = "8453";
const srcToken = "0x999FAF0AF2fF109938eeFE6A7BF91CA56f0D07e1";
const dstToken = "0x055d20a70eFd45aB839Ae1A39603D0cFDBDd8a13";

export function BridgeWidget() {
  return (
    <div className="pb-8">
      <TxWidget
        integratorId={process.env.NEXT_PUBLIC_INTEGRATOR_ID || ""}
        srcChain={srcChain}
        srcToken={srcToken}
        dstChain={dstChain}
        dstToken={dstToken}
        lightTheme={true}
        defaultWalletPicker={true}
      />
    </div>
  );
}
