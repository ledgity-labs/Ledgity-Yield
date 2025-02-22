import { ADDRESSES } from "@/data/addresses";

export function getContractAddress(
  contractName: string,
  chainId: number | string,
): `0x${string}` | undefined {
  return (ADDRESSES as any)[chainId]?.[contractName as string];
}
