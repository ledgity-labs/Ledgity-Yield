import makeBlockie from "ethereum-blockies-base64";
import { useEnsAvatar, useEnsName } from "wagmi";
import Image from "next/image";

export function Blockie({
  address,
  size = 28,
  className,
}: {
  address: string;
  size?: number;
  className?: string;
}) {
  const { data: ensName } = useEnsName({
    address: address as `0x${string}`,
    chainId: 1,
  });
  const { data: ensAvatar } = useEnsAvatar({
    name: ensName as string | undefined,
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
        <img
          src={makeBlockie(!address ? "default" : address)}
          alt="account-blockie"
        />
      )}
    </span>
  );
}
