import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import {
  SwapMsgsRequest,
  SwapRouteResponse,
  compareDenoms,
  getChains,
  getSwapRoute,
  getTransferRoute,
} from "./api";
import { IBCDenom, IBCHop } from "./types";

interface QueryOptions {
  onError?: ((err: unknown) => void) | undefined;
}

export function useSolveChains() {
  return useQuery({
    queryKey: ["solve-chains"],
    queryFn: () => {
      return getChains();
    },
    placeholderData: [],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useCompareDenoms(
  assets: IBCDenom[],
  options: QueryOptions = {}
) {
  return useQuery({
    queryKey: ["solve-compare-denoms", ...assets],
    queryFn: () => {
      return compareDenoms(assets);
    },
    onError: options.onError,
    retry: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: assets.length >= 2,
  });
}

export function useTransferRoute(
  sourceAsset?: IBCDenom,
  destinationAsset?: IBCDenom,
  enabled?: boolean
) {
  return useQuery({
    queryKey: ["solve-transfer-route", sourceAsset, destinationAsset],
    queryFn: async () => {
      if (!sourceAsset || !destinationAsset) {
        return [] as IBCHop[];
      }

      const response = await getTransferRoute(
        sourceAsset.denom,
        sourceAsset.chainId,
        destinationAsset.denom,
        destinationAsset.chainId
      );

      return response.requested;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: enabled && !!sourceAsset && !!destinationAsset,
  });
}

export function useSwapRoute(
  amountIn: string,
  sourceAsset?: IBCDenom,
  destinationAsset?: IBCDenom,
  enabled?: boolean
) {
  return useQuery({
    queryKey: ["solve-swap-route", amountIn, sourceAsset, destinationAsset],
    queryFn: async () => {
      if (!sourceAsset || !destinationAsset) {
        return {} as SwapRouteResponse;
      }

      const response = await getSwapRoute({
        amountIn,
        sourceAsset,
        destAsset: destinationAsset,
        cumulativeAffiliateFeeBps: "0",
      });

      return response;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: enabled && !!sourceAsset && !!destinationAsset && amountIn !== "0",
  });
}
