const AFFILIATE_URL = "http://localhost:9010";

export type AffiliateResponse = {
  isSuccess: boolean;
  message: string;
  referralUrl: string;
};

export async function createAffiliateCode(
  walletAddress: string,
): Promise<AffiliateResponse> {
  const body = {
    walletAddress,
  };

  const option = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };

  return fetch(AFFILIATE_URL + "/affiliate/create", option).then(
    async (res) => {
      const data: any = await res.json();
      return {
        isSuccess: res.ok,
        message: data.message,
        referralUrl: data.referralUrl,
      };
    },
  );
}
