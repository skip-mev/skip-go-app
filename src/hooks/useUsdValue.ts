import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { getAssets } from "@/chains";
import { raise } from "@/utils/assert";
import { getUsdPrice } from "@/utils/llama";

export interface Args {
  chainId: string;
  denom: string;
  value: string;
}

export function useUsdValue({ chainId, denom, value }: Args) {
  const queryKey = useMemo(
    () => ["USE_USD_VALUE", chainId, denom, value] as const,
    [chainId, denom, value],
  );
  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, chainId, denom, value] }) => {
      const assets = getAssets(chainId);
      const asset =
        assets.find((asset) => asset.base === denom) ||
        raise(`useUsdValue error: ${denom} not found in ${chainId}`);
      const coingeckoId =
        asset.coingecko_id ||
        raise(
          `useUsdValue error: ${denom} does not have a 'coingecko_id' in ${chainId}`,
        );
      const usd = await getUsdPrice({ coingeckoId });
      return parseFloat(value) * usd;
    },
    staleTime: 1000 * 60, // 1 minute
  });
}
