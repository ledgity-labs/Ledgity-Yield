import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TokenLogo,
} from "@/components/ui";
import { useState } from "react";
import { AdminLToken } from "./AdminLToken";
// Context
import { useAppDataContext } from "@/hooks/context/AppDataContextProvider";

export function AdminLTokens() {
  const { lTokenInfosCurrentChain } = useAppDataContext();
  const [lToken, setLToken] = useState(lTokenInfosCurrentChain[0]?.name);

  return (
    <section className="flex flex-col gap-6 justify-center items-center">
      <Select
        onValueChange={(value: string) => setLToken(value)}
        value={lToken}
      >
        <SelectTrigger>
          <SelectValue placeholder="No L-Tokens available" />
        </SelectTrigger>
        <SelectContent>
          {lTokenInfosCurrentChain.map((token) => (
            <SelectItem value={token.name} key={token.name}>
              <div className="flex justify-center items-center gap-[0.6rem]">
                <TokenLogo symbol={token.name} size={28} />
                <p className="font-semibold">{token.name}</p>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <AdminLToken lTokenSymbol={lToken} />
    </section>
  );
}
