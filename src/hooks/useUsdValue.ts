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

  const enabled = useMemo(() => {
    const parsed = parseFloat(value);
    return !isNaN(parsed) && parsed > 0;
  }, [value]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, chainId, denom, value] }) => {
      return getUsdValue({ chainId, denom, value });
    },
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
}

export function useUsdDiffValue([args1, args2]: [Args, Args]) {
  const queryKey = useMemo(() => {
    const hash = [...Object.values(args1), ...Object.values(args2)].join("-");
    return ["USE_USD_DIFF_VALUES", hash] as const;
  }, [args1, args2]);

  const enabled = useMemo(() => {
    const parsed1 = parseFloat(args1.value);
    const parsed2 = parseFloat(args2.value);
    return !isNaN(parsed1) && parsed1 > 0 && !isNaN(parsed2) && parsed2 > 0;
  }, [args1.value, args2.value]);

  return useQuery({
    // intentionally not including args1 and args2 since query key is using
    // hashed values of args1 and args2
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey,
    queryFn: async () => {
      const [v1, v2] = await Promise.all([
        getUsdValue(args1),
        getUsdValue(args2),
      ]);
      // return percentage difference
      return ((v2 - v1) / v1) * 100;
    },
    staleTime: 1000 * 60, // 1 minute
    enabled,
  });
}

async function getUsdValue({ chainId, denom, value }: Args) {
  const assets = getAssets(chainId);
  const asset =
    assets.find((asset) => asset.base === denom) ||
    raise(`getUsdValue error: ${denom} not found in ${chainId}`);
  const coingeckoId =
    asset.coingecko_id ||
    raise(
      `getUsdValue error: ${denom} does not have a 'coingecko_id' in ${chainId}`,
    );
  const usd = await getUsdPrice({ coingeckoId });
  return parseFloat(value) * usd;
}
