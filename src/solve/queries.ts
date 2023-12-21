import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { useSkipClient } from "./hooks";

export function useAssets() {
  const skipClient = useSkipClient();

  return useQuery({
    queryKey: ["solve-assets"],
    queryFn: () => {
      return skipClient.assets({
        includeEvmAssets: true,
        includeCW20Assets: true,
      });
    },
  });
}

export function useSolveChains() {
  const skipClient = useSkipClient();
  return useQuery({
    queryKey: ["solve-chains"],
    queryFn: () => {
      return skipClient.chains({
        includeEVM: true,
      });
    },
    placeholderData: [],
  });
}

interface UseRouteArgs {
  direction: "swap-in" | "swap-out";
  amount: string;
  sourceAsset?: string;
  sourceAssetChainID?: string;
  destinationAsset?: string;
  destinationAssetChainID?: string;
  enabled?: boolean;
}

export function useRoute({
  direction,
  amount,
  sourceAsset,
  sourceAssetChainID,
  destinationAsset,
  destinationAssetChainID,
  enabled,
}: UseRouteArgs) {
  const skipClient = useSkipClient();

  const [refetchCount, setRefetchCount] = useState(0);

  return useQuery({
    queryKey: [
      "solve-route",
      direction,
      amount,
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

      const route = await skipClient.route(
        direction === "swap-in"
          ? {
              amountIn: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
            }
          : {
              amountOut: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
            },
      );

      if (!route.operations) {
        throw new Error("No route found");
      }

      return route;
    },
    refetchInterval: (query) => {
      if (refetchCount < 10 && query.isActive()) {
        setRefetchCount((c) => c + 1);
        return 1000 * 2;
      }
      return false;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: false,
    enabled:
      enabled &&
      !!sourceAsset &&
      !!destinationAsset &&
      !!sourceAssetChainID &&
      !!destinationAssetChainID &&
      amount !== "0",
  });
}
