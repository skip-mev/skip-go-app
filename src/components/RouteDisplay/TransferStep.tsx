import { BridgeType } from "@skip-router/core";
import { useMemo } from "react";

import { useAssets } from "@/context/assets";
import { useBridgeByID } from "@/hooks/useBridges";
import { useChainByID } from "@/hooks/useChains";
import { useBroadcastedTxsStatus } from "@/solve";
import { onImageError } from "@/utils/image";

import { AdaptiveLink } from "../AdaptiveLink";
import { Gap } from "../common/Gap";
import { Action } from "./make-actions";
import { makeStepState } from "./make-step-state";
import { Step } from "./Step";

export interface TransferAction {
  type: "TRANSFER";
  asset: string;
  sourceChain: string;
  destinationChain: string;
  id: string;
  bridgeID: BridgeType;
}

interface TransferStepProps {
  actions: Action[];
  action: TransferAction;
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}

export const TransferStep = ({ action, actions, statusData }: TransferStepProps) => {
  const { getAsset } = useAssets();
  const { data: bridge } = useBridgeByID(action.bridgeID);
  const { data: sourceChain } = useChainByID(action.sourceChain);
  const { data: destinationChain } = useChainByID(action.destinationChain);

  const { explorerLink, state, operationIndex } = makeStepState({ actions, action, statusData });

  const isFirstOpSwap = actions[0]?.type === "SWAP";

  const renderTransferState = useMemo(() => {
    // We don't show loading state if first operation is swap operation, loading will be in swap operation
    if (isFirstOpSwap) {
      if (state === "TRANSFER_FAILURE") {
        return <Step.FailureState />;
      }
      if (state === "TRANSFER_SUCCESS") {
        return <Step.SuccessState />;
      }
      return <Step.DefaultState />;
    }
    // We can assume that the transfer operation is successful when the state is TRANSFER_SUCCESS or TRANSFER_RECEIVED
    switch (state) {
      case "TRANSFER_SUCCESS":
        return <Step.SuccessState />;
      case "TRANSFER_RECEIVED":
        return <Step.SuccessState />;
      case "TRANSFER_FAILURE":
        return <Step.FailureState />;
      case "TRANSFER_PENDING":
        return <Step.LoadingState />;

      default:
        return <div className="h-2 w-2 rounded-full bg-neutral-200" />;
    }
  }, [isFirstOpSwap, state]);

  const asset = (() => {
    const currentAsset = getAsset(action.asset, action.sourceChain);
    if (currentAsset) return currentAsset;
    const prevAction = actions[operationIndex - 1];
    if (!prevAction || prevAction.type !== "TRANSFER") return;
    const prevAsset = getAsset(prevAction.asset, prevAction.sourceChain);
    return prevAsset;
  })();

  if (!sourceChain || !destinationChain) {
    // this should be unreachable
    return null;
  }

  if (!asset) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">{renderTransferState}</div>
        <div className="max-w-[18rem] space-y-1 text-sm text-neutral-500">
          <Gap.Parent>
            <span>Transfer</span>
            <span>from</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={sourceChain.logoURI}
                alt={sourceChain.prettyName}
                onError={onImageError}
              />
              <span className="font-semibold text-black">{sourceChain.prettyName}</span>
            </Gap.Child>
          </Gap.Parent>
          <Gap.Parent>
            <span>to</span>
            <Gap.Child>
              <img
                className="inline-block h-4 w-4"
                src={destinationChain.logoURI}
                alt={destinationChain.prettyName}
                onError={onImageError}
              />
              <span className="font-semibold text-black">{destinationChain.prettyName}</span>
            </Gap.Child>
            {bridge && (
              <>
                <span>with</span>
                <Gap.Child>
                  {bridge.name.toLowerCase() !== "ibc" && (
                    <img
                      className="inline-block h-4 w-4"
                      src={bridge.logoURI}
                      alt={bridge.name}
                      onError={onImageError}
                    />
                  )}

                  <span className="font-semibold text-black">{bridge.name}</span>
                </Gap.Child>
              </>
            )}
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

  return (
    <div className="flex items-center gap-2">
      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center">{renderTransferState}</div>
      <div className="max-w-[18rem] space-y-1 text-sm text-neutral-500">
        <Gap.Parent>
          <span>Transfer</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={asset.logoURI}
              alt={asset.name}
            />
            <span className="font-semibold text-black">{asset.recommendedSymbol}</span>
          </Gap.Child>
          <span>from</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={sourceChain.logoURI}
              alt={sourceChain.prettyName}
              onError={onImageError}
            />
            <span className="font-semibold text-black">{sourceChain.prettyName}</span>
          </Gap.Child>
        </Gap.Parent>
        <Gap.Parent>
          <span>to</span>
          <Gap.Child>
            <img
              className="inline-block h-4 w-4"
              src={destinationChain.logoURI}
              alt={destinationChain.prettyName}
              onError={onImageError}
            />
            <span className="font-semibold text-black">{destinationChain.prettyName}</span>
          </Gap.Child>
          {bridge && (
            <>
              <span>with</span>
              <Gap.Child>
                {bridge.name.toLowerCase() !== "ibc" && (
                  <img
                    className="inline-block h-4 w-4"
                    src={bridge.logoURI}
                    alt={bridge.name}
                    onError={onImageError}
                  />
                )}

                <span className="font-semibold text-black">{bridge.name}</span>
              </Gap.Child>
            </>
          )}
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
