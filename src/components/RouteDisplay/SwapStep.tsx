import { useMemo } from "react";

import { SWAP_VENUES } from "@/constants/swap-venues";
import { useAssets } from "@/context/assets";
import { useBroadcastedTxsStatus } from "@/solve";
import { onImageError } from "@/utils/image";
import { makeExplorerLink } from "@/utils/link";

import { AdaptiveLink } from "../AdaptiveLink";
import { Gap } from "../common/Gap";
import { Action } from ".";
import { Step } from "./Step";

export interface SwapAction {
  type: "SWAP";
  sourceAsset: string;
  destinationAsset: string;
  chain: string;
  venue: string;
  id: string;
}

export interface SwapStepProps {
  action: SwapAction;
  actions: Action[];
  id: string;
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}

export const SwapStep = ({ action, actions, id, statusData }: SwapStepProps) => {
  const { getAsset } = useAssets();

  const assetIn = useMemo(() => {
    return getAsset(action.sourceAsset, action.chain);
  }, [action.chain, action.sourceAsset, getAsset]);

  const assetOut = useMemo(() => {
    return getAsset(action.destinationAsset, action.chain);
  }, [action.chain, action.destinationAsset, getAsset]);

  const venue = SWAP_VENUES[action.venue];

  // format: operationType-<operationTypeCount>-<operationIndex>
  const operationIndex = Number(id.split("-")[2]);
  const operationTypeCount = Number(id.split("-")[1]);
  const isSwapFirstStep = operationIndex === 0 && operationTypeCount === 0;

  const sequenceIndex = Number(
    actions
      // We can assume that the swap operation by the previous transfer
      .find((x) => Number(x.id.split("-")[2]) === operationIndex - 1)
      ?.id.split("-")[1],
  );
  const swapStatus = statusData?.transferSequence[isSwapFirstStep ? 0 : sequenceIndex];

  // as for swap operations, we can assume that the swap is successful if the previous transfer state is TRANSFER_SUCCESS
  const renderSwapState = useMemo(() => {
    if (isSwapFirstStep) {
      if (swapStatus?.state === "TRANSFER_PENDING") {
        return <Step.LoadingState />;
      }
      if (swapStatus?.state === "TRANSFER_SUCCESS") {
        return <Step.SuccessState />;
      }
      if (swapStatus?.state === "TRANSFER_FAILURE") {
        return <Step.FailureState />;
      }

      return <div className="h-2 w-2 rounded-full bg-neutral-200" />;
    }
    switch (swapStatus?.state) {
      case "TRANSFER_RECEIVED":
        return <Step.LoadingState />;
      case "TRANSFER_SUCCESS":
        return <Step.SuccessState />;
      case "TRANSFER_FAILURE":
        return <Step.FailureState />;
      default:
        return <Step.DefaultState />;
    }
  }, [isSwapFirstStep, swapStatus?.state]);

  const explorerLink = useMemo(() => {
    const tx = isSwapFirstStep ? swapStatus?.txs.sendTx : swapStatus?.txs.receiveTx;
    if (!tx) return;
    if (swapStatus?.state !== "TRANSFER_SUCCESS") return;
    return makeExplorerLink(tx.explorerLink);
  }, [isSwapFirstStep, swapStatus?.state, swapStatus?.txs.receiveTx, swapStatus?.txs.sendTx]);

  if (!assetIn && assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div className="max-w-[18rem]">
          <Gap.Parent className="text-sm text-neutral-500">
            <span>Swap to</span>
            <Gap.Child>
              <img
                alt={assetOut.name}
                className="inline-block h-4 w-4"
                onError={onImageError}
                src={assetOut.logoURI}
              />
              <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <img
                alt={venue.name}
                className="inline-block h-4 w-4"
                onError={onImageError}
                src={venue.imageURL}
              />
              <span className="font-semibold text-black">{venue.name}</span>
            </Gap.Child>
          </Gap.Parent>
          {explorerLink && (
            <AdaptiveLink
              className="text-xs font-semibold text-[#FF486E] underline"
              href={explorerLink.link}
            >
              {explorerLink.shorthand}
            </AdaptiveLink>
          )}
        </div>
      </div>
    );
  }

  if (assetIn && !assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
        <div>
          <Gap.Parent className="text-sm text-neutral-500">
            <span>Swap</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={assetIn.logoURI}
                alt={assetIn.name}
              />
              <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
            </Gap.Child>
            <span>on</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={venue.imageURL}
                alt={venue.name}
              />
              <span className="font-semibold text-black">{venue.name}</span>
            </Gap.Child>
          </Gap.Parent>
          {explorerLink && (
            <AdaptiveLink
              className="text-xs font-semibold text-[#FF486E] underline"
              href={explorerLink.link}
            >
              {explorerLink.shorthand}
            </AdaptiveLink>
          )}
        </div>
      </div>
    );
  }

  if (!assetIn || !assetOut) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-14 w-14 items-center justify-center">{renderSwapState}</div>
      <div className="max-w-[18rem]">
        <Gap.Parent className="text-sm text-neutral-500">
          <span>Swap</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={assetIn.logoURI}
              alt={assetIn.name}
            />
            <span className="font-semibold text-black">{assetIn.recommendedSymbol}</span>
          </Gap.Child>
          <span>for</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={assetOut.logoURI}
              alt={assetOut.name}
            />
            <span className="font-semibold text-black">{assetOut.recommendedSymbol}</span>
          </Gap.Child>
          <Gap.Child>
            <span>on</span>
            <img
              className="inline-block h-4 w-4"
              src={venue.imageURL}
              alt={venue.name}
            />
            <span className="font-semibold text-black">{venue.name}</span>
          </Gap.Child>
        </Gap.Parent>
        {explorerLink && (
          <AdaptiveLink
            className="text-xs font-semibold text-[#FF486E] underline"
            href={explorerLink.link}
          >
            {explorerLink.shorthand}
          </AdaptiveLink>
        )}
      </div>
    </div>
  );
};
