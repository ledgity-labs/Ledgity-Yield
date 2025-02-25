import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TokenLogo,
} from "@/components/ui";
import { useState, useEffect } from "react";
import { AdminLToken } from "./AdminLToken";
// Context
import { useAppDataContext } from "@/hooks/context/AppDataContextProvider";

export function AdminLTokens() {
  const { lTokenInfosCurrentChain } = useAppDataContext();
  const [lTokenSymbol, setLTokenSymbol] = useState(
    lTokenInfosCurrentChain[0]?.symbol,
  );

  useEffect(() => {
    if (lTokenInfosCurrentChain.length) {
      setLTokenSymbol(lTokenInfosCurrentChain[0].symbol);
    }
  }, [lTokenInfosCurrentChain]);

  return (
    <section className="flex flex-col gap-6 justify-center items-center">
      {lTokenInfosCurrentChain.length ? (
        <>
          <Select
            onValueChange={(value: string) => setLTokenSymbol(value)}
            value={lTokenSymbol}
          >
            <SelectTrigger>
              <SelectValue placeholder="No L-Tokens available" />
            </SelectTrigger>
            <SelectContent>
              {lTokenInfosCurrentChain.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex justify-center items-center gap-[0.6rem]">
                    <TokenLogo symbol={token.symbol} size={28} />
                    <p className="font-semibold">{token.symbol}</p>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <AdminLToken lTokenSymbol={lTokenSymbol} />
        </>
      ) : (
        <p>No L-Tokens available</p>
      )}
    </section>
  );
}
