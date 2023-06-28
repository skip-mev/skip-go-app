import { useQuery } from "@tanstack/react-query";
import { getChains, getRoute, getSwapRoute } from "./api";
import axios from "axios";
import { chainNameToChainlistURL } from "@/config";
import { Asset } from "@/components/AssetSelect";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useSolveChains() {
  return useQuery({
    queryKey: ["solve-chains"],
    queryFn: () => {
      return getChains();
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useSolveRoute(
  sourceAsset: string,
  sourceChainID: string,
  destAsset: string,
  destChainID: string
) {
  return useQuery({
    queryKey: [
      "solve-route",
      sourceAsset,
      sourceChainID,
      destAsset,
      destChainID,
    ],
    queryFn: async () => {
      // await wait(2000);

      try {
        const response = await getRoute(
          sourceAsset,
          sourceChainID,
          destAsset,
          destChainID
        );

        if (response.requested.length > 0) {
          return response.requested;
        }

        if (response.recs.length <= 0) {
          return [];
        }

        return response.recs[0].route;
      } catch {
        return [];
      }
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: !!sourceAsset && !!sourceChainID && !!destChainID,
  });
}

export function useChainAssets(chainName?: string) {
  return useQuery({
    queryKey: ["chain-assets", chainName],
    queryFn: async () => {
      if (!chainName) {
        return [];
      }

      const response = await axios.get(
        `${chainNameToChainlistURL(chainName)}/assets.json`
      );

      const responseJSON = response.data as Asset[];

      return responseJSON;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!chainName,
  });
}

export function useAssetBalances(chainName?: string) {
  return useQuery({
    queryKey: ["asset-balances", chainName],
    queryFn: async () => {
      if (!chainName) {
        return [];
      }

      const response = await axios.get(
        `${chainNameToChainlistURL(chainName)}/balances.json`
      );

      const responseJSON = response.data as Asset[];

      return responseJSON;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!chainName,
  });
}

export function useSwapRoute(
  amount: string,
  sourceAsset: string,
  sourceChain: string,
  destAsset: string,
  destChain: string
) {
  return useQuery({
    queryKey: [
      "swap-route",
      amount,
      sourceAsset,
      sourceChain,
      destAsset,
      destChain,
    ],
    queryFn: () => {
      return getSwapRoute({
        amountIn: amount,
        sourceAsset: {
          denom: sourceAsset,
          chainId: sourceChain,
        },
        destAsset: {
          denom: destAsset,
          chainId: destChain,
        },
        cumulativeAffiliateFeeBps: "0",
      });
    },
    retry: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled:
      !!amount && !!sourceAsset && !!sourceChain && !!destAsset && !!destChain,
  });
}
