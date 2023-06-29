"use client";
import { useEffect, useMemo, useState } from "react";
import { useChainAssets, useSolveChains, useSwapRoute } from "@/solve/queries";
import SwapForm, { SwapFormValues } from "@/components/SwapForm";
import SwapDisplay from "@/components/SwapDisplay";
import PathDisplay from "@/components/PathDisplay";
import { Asset } from "@/components/AssetSelect";
import { ethers } from "ethers";

const DEFAULT_SOURCE_CHAIN_ID = "osmosis-1";
const DEFAULT_DESTINATION_CHAIN_ID = "cosmoshub-4";

function SwapPage() {
  const [formState, setFormState] = useState<SwapFormValues>({
    amountIn: "1.0",
  });

  const { data: supportedChains } = useSolveChains();

  useEffect(() => {
    if (supportedChains && !formState.sourceChain) {
      const _sourceChain =
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_SOURCE_CHAIN_ID
        ) ?? supportedChains[0];

      setFormState({
        ...formState,
        sourceChain: _sourceChain,
      });
    }

    if (supportedChains && !formState.destinationChain) {
      const _destinationChain =
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_DESTINATION_CHAIN_ID
        ) ?? supportedChains[0];

      setFormState({
        ...formState,
        destinationChain: _destinationChain,
      });
    }
  }, [formState, supportedChains]);

  const { data: sourceChainAssets } = useChainAssets(
    formState.sourceChain?.chainName
  );

  useEffect(() => {
    if (
      sourceChainAssets &&
      sourceChainAssets.length > 0 &&
      !formState.sourceAsset
    ) {
      setFormState({
        ...formState,
        sourceAsset: sourceChainAssets[0],
      });
    }
  }, [formState, sourceChainAssets]);

  const { data: destinationChainAssets } = useChainAssets(
    formState.destinationChain?.chainName
  );

  useEffect(() => {
    if (
      destinationChainAssets &&
      destinationChainAssets.length > 0 &&
      !formState.destinationAsset
    ) {
      setFormState({
        ...formState,
        destinationAsset: destinationChainAssets[0],
      });
    }
  }, [formState, destinationChainAssets]);

  const amountInFixed = useMemo(() => {
    if (!formState.sourceAsset || formState.amountIn === "") {
      return "";
    }

    try {
      return ethers
        .parseUnits(formState.amountIn, formState.sourceAsset.decimals)
        .toString();
    } catch {
      return "";
    }
  }, [formState.amountIn, formState.sourceAsset]);

  const {
    data: swapRouteResponse,
    status: swapRouteQueryStatus,
    isInitialLoading,
  } = useSwapRoute(
    amountInFixed,
    formState.sourceAsset?.denom ?? "",
    formState.sourceChain?.chainId ?? "",
    formState.destinationAsset?.denom ?? "",
    formState.destinationChain?.chainId ?? ""
  );

  const chainIDs = useMemo(() => {
    if (!swapRouteResponse) {
      return [];
    }

    return [
      ...swapRouteResponse.preSwapHops.map((hop) => hop.chainId),
      // swapRouteResponse.userSwap.swapVenue.chainId,
      ...swapRouteResponse.postSwapHops.map((hop) => hop.chainId),
      swapRouteResponse.destAsset.chainId,
    ];
  }, [swapRouteResponse]);

  return (
    <div className="flex gap-6">
      <div className="w-full max-w-xl">
        <SwapForm
          onChange={(newFormState) => setFormState(newFormState)}
          values={formState}
        />
      </div>
      <div className="flex-1">
        <div className="p-6">
          {formState.sourceAsset && formState.destinationAsset && (
            <PathDisplay
              assets={[
                formState.sourceAsset as Asset,
                formState.destinationAsset as Asset,
              ]}
              chainIDs={chainIDs}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default SwapPage;
