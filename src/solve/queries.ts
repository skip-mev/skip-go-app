import { useQuery } from "@tanstack/react-query";
import { SkipClient } from "./client";

export function useAssets(client: SkipClient) {
  return useQuery({
    queryKey: ["solve-assets"],
    queryFn: async () => {
      const assets = await client.fungible.getAssets();

      return assets;
    },
  });
}

export function useSolveChains(client: SkipClient) {
  return useQuery({
    queryKey: ["solve-chains"],
    queryFn: () => {
      return client.chains();
    },
    placeholderData: [],
  });
}

export function useRoute(
  client: SkipClient,
  amountIn: string,
  sourceAsset?: string,
  sourceAssetChainID?: string,
  destinationAsset?: string,
  destinationAssetChainID?: string,
  enabled?: boolean
) {
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

      const route = await client.fungible.getRoute({
        amount_in: amountIn,
        source_asset_denom: sourceAsset,
        source_asset_chain_id: sourceAssetChainID,
        dest_asset_denom: destinationAsset,
        dest_asset_chain_id: destinationAssetChainID,
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
