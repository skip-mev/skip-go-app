import { useQuery } from "@tanstack/react-query";
import { getChains, getRoute } from "./api";
import axios from "axios";
import { chainNameToChainlistURL } from "@/config";
import { Asset } from "@/components/AssetSelect";

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
  destChainID: string
) {
  return useQuery({
    queryKey: ["solve-route", sourceAsset, sourceChainID, destChainID],
    queryFn: async () => {
      try {
        const response = await getRoute(
          sourceAsset,
          sourceChainID,
          destChainID
        );

        if (response.recs.length <= 0) {
          return [];
        }

        const route = response.recs[0].route;

        for (const hop of route.slice(1)) {
          if (!hop.pfmEnabled) {
            console.log("route found but not pfm enabled");
            console.log(route);
            return [];
          }
        }

        return route;
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
