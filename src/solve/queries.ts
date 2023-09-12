import { useQuery } from "@tanstack/react-query";
import { useSkipClient } from "./hooks";

export function useAssets() {
  const skipClient = useSkipClient();

  return useQuery({
    queryKey: ["solve-assets"],
    queryFn: () => {
      return skipClient.assets();
    },
  });
}

export function useSolveChains() {
  const skipClient = useSkipClient();
  return useQuery({
    queryKey: ["solve-chains"],
    queryFn: () => {
      return skipClient.chains();
    },
    placeholderData: [],
  });
}

export function useRoute(
  amountIn: string,
  sourceAsset?: string,
  sourceAssetChainID?: string,
  destinationAsset?: string,
  destinationAssetChainID?: string,
  enabled?: boolean
) {
  const skipClient = useSkipClient();

  return useQuery({
    queryKey: [
      "solve-route",
      amountIn,
      sourceAsset,
      destinationAsset,
      sourceAssetChainID,
      destinationAssetChainID,
    ],
    queryFn: async () => {
      if (
        !sourceAsset ||
        !sourceAssetChainID ||
        !destinationAsset ||
        !destinationAssetChainID
      ) {
        return;
      }

      const route = await skipClient.route({
        amountIn: amountIn,
        sourceAssetDenom: sourceAsset,
        sourceAssetChainID: sourceAssetChainID,
        destAssetDenom: destinationAsset,
        destAssetChainID: destinationAssetChainID,
      });

      if (!route.operations) {
        throw new Error("No route found");
      }

      return route;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled:
      enabled &&
      !!sourceAsset &&
      !!destinationAsset &&
      !!sourceAssetChainID &&
      !!destinationAssetChainID &&
      amountIn !== "0",
  });
}
