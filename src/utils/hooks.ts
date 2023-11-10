import { RouteResponse } from "@skip-router/core";
import { useEffect, useLayoutEffect, useMemo, useRef } from "react";

import { useChains } from "@/api/queries";
import { getFinalityTime } from "@/constants/finality";

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // Remember the latest callback if it changes.
  useIsomorphicLayoutEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    // Don't schedule if no delay is specified.
    // Note: 0 is a valid value for delay.
    if (!delay && delay !== 0) {
      return;
    }

    const id = setInterval(() => savedCallback.current(), delay);

    return () => clearInterval(id);
  }, [delay]);
}

export function useFinalityTimeEstimate(route: RouteResponse) {
  const { chains = [] } = useChains();

  return useMemo(() => {
    for (const operation of route.operations) {
      if ("axelarTransfer" in operation) {
        const sourceChain = chains.find(
          ({ chainID }) => chainID === operation.axelarTransfer.fromChainID,
        );
        if (sourceChain?.chainType === "evm") {
          return getFinalityTime(sourceChain.chainID);
        }

        const destinationChain = chains.find(
          ({ chainID }) => chainID === operation.axelarTransfer.toChainID,
        );
        if (destinationChain?.chainType === "evm") {
          return getFinalityTime(destinationChain.chainID);
        }
      }
    }

    return "";
  }, [chains, route.operations]);
}
