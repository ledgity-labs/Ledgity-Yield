import Image from "next/image";

export const chainsIcons: { [key: number]: string } = {
  1: "/assets/chains/ethereum-mainnet.svg",
  31337: "/assets/chains/hardhat.svg",
  421613: "/assets/chains/arbitrum-goerli.png",
  42161: "/assets/chains/arbitrum.svg",
  59140: "/assets/chains/linea-goerli.png",
  59144: "/assets/chains/linea.png",
  195: "/assets/chains/okxlogo.png",
  196: "/assets/chains/okxlogo.png",
  8453: "/assets/chains/base.png",
  84532: "/assets/chains/base.png",
  11155111: "/assets/chains/ethereum-sepolia.png",
};

export function NetworkIcon({
  chainName,
  chainId,
}: {
  chainName: string | undefined;
  chainId: number;
}) {
  return (
    <Image
      alt={chainName ?? "Chain icon"}
      src={chainsIcons?.[chainId] ?? ""}
      width={20}
      height={20}
      className="sm:w-6 w-7 sm:h-6 h-7 rounded-md overflow-hidden"
    />
  );
}
