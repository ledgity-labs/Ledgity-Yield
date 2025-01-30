import { FC } from "react";
import Image, { type StaticImageData } from "next/image";
import ldyTokenLogo from "~/assets/tokens/ldy.svg";
import lynxTokenLogo from "~/assets/tokens/lynx.svg";
import usdcTokenLogo from "~/assets/tokens/usdc.png";
import lusdcTokenLogo from "~/assets/tokens/lusdc.png";
import eurocTokenLogo from "~/assets/tokens/euroc.png";
import leurocTokenLogo from "~/assets/tokens/leuroc.png";
import lvcTokenLogo from "~/assets/tokens/lvc.png";
import hznTokenLogo from "~/assets/tokens/hzn.png";
import aaTokenLogo from "~/assets/tokens/aa.svg";
import unknownTokenLogo from "~/assets/tokens/unknown.svg";
import leurcTokenLogo from "~/assets/tokens/leurc.png";
import eurcTokenLogo from "~/assets/tokens/eurc.png";

export const tokensLogos: Record<string, StaticImageData> = {
  LDY: ldyTokenLogo,
  USDC: usdcTokenLogo,
  EUROC: eurocTokenLogo,
  LEUROC: leurocTokenLogo,
  LUSDC: lusdcTokenLogo,
  LYNX: lynxTokenLogo,
  LVC: lvcTokenLogo,
  HZN: hznTokenLogo,
  AA: aaTokenLogo,
  LEURC: leurcTokenLogo,
  EURC: eurcTokenLogo,
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  symbol: string;
  size: number;
}

export const TokenLogo: FC<Props> = ({ symbol, size, className }) => {
  // If this is a known token
  if (tokensLogos[symbol]) {
    return (
      <Image
        src={tokensLogos[symbol]}
        alt={`${symbol} logo`}
        height={size}
        width={size}
        className={className}
      />
    );
  }

  // Of it is an unknown token
  else {
    return (
      <Image
        src={unknownTokenLogo}
        alt="Unknown token logo"
        height={size}
        width={size}
        className={className}
      />
    );
  }
};
