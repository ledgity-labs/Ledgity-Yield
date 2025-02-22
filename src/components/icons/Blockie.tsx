import makeBlockie from "ethereum-blockies-base64";
import { useEnsAvatar, useEnsName } from "wagmi";
import Image from "next/image";
import { Address } from "viem";

export function Blockie({
  address,
  size = 28,
  className,
}: {
  address: string | undefined;
  size?: number;
  className?: string;
}) {
  const typedAddress = address ? (address as Address) : undefined;

  const { data: ensName } = useEnsName({
    address: typedAddress,
    chainId: 1,
  });

  // @dev Mad about null value so fallback to undefined
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: 1,
  });

  return (
    <span
      className={`flex-none flex items-center ${className || ""}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      {ensAvatar ? (
        <Image
          className="h-full aspect-square w-auto"
          src={ensAvatar}
          width={size}
          height={size}
          alt="profile avatar"
        />
      ) : (
        <Image
          src={makeBlockie(!typedAddress ? "default" : typedAddress)}
          width={size}
          height={size}
          alt="account-blockie"
        />
      )}
    </span>
  );
}
