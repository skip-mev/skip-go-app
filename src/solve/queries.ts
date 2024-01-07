import { AssetsRequest, SwapVenue } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { useSkipClient } from "./hooks";

export function useAssets(options: AssetsRequest = {}) {
  const skipClient = useSkipClient();

  const queryKey = useMemo(() => ["solve-assets", options] as const, [options]);

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, options] }) => {
      return skipClient.assets({
        includeEvmAssets: true,
        includeCW20Assets: true,
        ...options,
      });
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
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
  swapVenue?: SwapVenue;
}

export function useRoute({
  direction,
  amount,
  sourceAsset,
  sourceAssetChainID,
  destinationAsset,
  destinationAssetChainID,
  enabled,
  swapVenue,
}: UseRouteArgs) {
  const skipClient = useSkipClient();

  const [refetchCount, setRefetchCount] = useState(0);

  const queryKey = useMemo(
    () =>
      [
        "solve-route",
        direction,
        amount,
        sourceAsset,
        destinationAsset,
        sourceAssetChainID,
        destinationAssetChainID,
        swapVenue,
      ] as const,
    [
      amount,
      destinationAsset,
      destinationAssetChainID,
      direction,
      sourceAsset,
      sourceAssetChainID,
      swapVenue,
    ],
  );

  const query = useQuery({
    queryKey,
    queryFn: async ({
      queryKey: [
        ,
        direction,
        amount,
        sourceAsset,
        destinationAsset,
        sourceAssetChainID,
        destinationAssetChainID,
        swapVenue,
      ],
    }) => {
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
              swapVenue,
            }
          : {
              amountOut: amount,
              sourceAssetDenom: sourceAsset,
              sourceAssetChainID: sourceAssetChainID,
              destAssetDenom: destinationAsset,
              destAssetChainID: destinationAssetChainID,
              swapVenue,
            },
      );

      if (!route.operations) {
        throw new Error("No route found");
      }

      return route;
    },
    refetchInterval: refetchCount < 10 ? 1000 * 5 : false,
    retry: false,
    enabled:
      enabled &&
      !!sourceAsset &&
      !!destinationAsset &&
      !!sourceAssetChainID &&
      !!destinationAssetChainID &&
      amount !== "0",
  });

  useEffect(() => {
    if (query.isRefetching) {
      setRefetchCount((count) => count + 1);
    }
  }, [query.isRefetching]);

  useEffect(() => {
    setRefetchCount(0);
  }, [queryKey]);

  return query;
}
