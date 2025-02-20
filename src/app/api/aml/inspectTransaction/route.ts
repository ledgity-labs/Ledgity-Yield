import { NextResponse, NextRequest } from "next/server";
import {
  AlertContext,
  isAccountHighRisk,
  isAccountSanctioned,
} from "../common";
import { parseEventLogs } from "viem";
import { lTokenAbi } from "@/types";

export const revalidate = 0;

const lusdcAddresses = [
  "0xd54d564606611A3502FE8909bBD3075dbeb77813",
  "0x4AF215DbE27fc030F37f73109B85F421FAB45B7a",
];

export const POST = async (request: NextRequest) => {
  // Retrieve Tenderly webhook data
  const body = await request.json();

  // Iterate over the logs to find the "Transfer" events
  const logs = parseEventLogs({
    abi: lTokenAbi,
    logs: body.transaction.logs,
  });
  for (const log of logs) {
    if (log.eventName === "Transfer") {
      // Isolate the "from" and "to" addresses
      const from = log.args.from;
      const to = log.args.to;
      const alertContext: AlertContext = {
        chainId: body.transaction.network_id,
        txHash: body.transaction.hash,
        blockNumber: body.transaction.block_number,
      };

      // Check whether the wallets are OFAC sanctioned and/or high-risk
      // Ignore LUSDC contracts
      for (const account of [from, to]) {
        if (!lusdcAddresses.includes(account)) {
          if (
            (await isAccountSanctioned(account, true, alertContext)) ||
            (await isAccountHighRisk(account, true, alertContext))
          )
            return NextResponse.json({ restricted: true });
        }
      }
    }
  }

  // If the IP and wallet address are not restricted
  return NextResponse.json({ restricted: false });
};
