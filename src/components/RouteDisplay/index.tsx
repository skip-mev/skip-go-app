import { RouteResponse } from "@skip-router/core";
import { Dispatch, Fragment, SetStateAction, useMemo } from "react";
import { formatUnits } from "viem";

import { useAssets } from "@/context/assets";
import { useChainByID } from "@/hooks/useChains";
import { useBroadcastedTxsStatus } from "@/solve";

import { ExpandArrow } from "../Icons/ExpandArrow";
import { BroadcastedTx } from "../TransactionDialog/TransactionDialogContent";
import { makeActions } from "./make-actions";
import { RouteEnd } from "./RouteEnd";
import { SwapStep } from "./SwapStep";
import { TransferStep } from "./TransferStep";

interface RouteDisplayProps {
  route: RouteResponse;
  isRouteExpanded: boolean;
  setIsRouteExpanded: Dispatch<SetStateAction<boolean>>;
  broadcastedTxs?: BroadcastedTx[];
}

export const RouteDisplay = ({ route, isRouteExpanded, setIsRouteExpanded, broadcastedTxs }: RouteDisplayProps) => {
  const { getAsset } = useAssets();

  const sourceAsset = getAsset(route.sourceAssetDenom, route.sourceAssetChainID);

  const destinationAsset = getAsset(route.destAssetDenom, route.destAssetChainID);

  const { data: sourceChain } = useChainByID(route.sourceAssetChainID);
  const { data: destinationChain } = useChainByID(route.destAssetChainID);

  const amountIn = useMemo(() => {
    try {
      return formatUnits(BigInt(route.amountIn), sourceAsset?.decimals ?? 6);
    } catch {
      return "0";
    }
  }, [route.amountIn, sourceAsset?.decimals]);

  const amountOut = useMemo(() => {
    try {
      return formatUnits(BigInt(route.amountOut), destinationAsset?.decimals ?? 6);
    } catch {
      return "0";
    }
  }, [route.amountOut, destinationAsset?.decimals]);

  const actions = useMemo(() => makeActions({ route }), [route]);
  const { data: statusData } = useBroadcastedTxsStatus({ txsRequired: route.txsRequired, txs: broadcastedTxs });

  return (
    <div className="relative h-full">
      <div className="absolute inset-y-0 flex w-14 items-center justify-center py-7">
        <div className="h-full w-0.5 bg-neutral-200"></div>
      </div>
      <div className="relative flex h-full flex-col justify-between gap-4">
        <div className="flex items-center justify-between pr-4">
          <RouteEnd
            amount={amountIn}
            symbol={sourceAsset?.recommendedSymbol ?? "UNKNOWN"}
            logo={sourceAsset?.logoURI ?? "UNKNOWN"}
            chain={sourceChain?.prettyName ?? ""}
          />
          {isRouteExpanded && (
            <button
              className="animate-slide-up-and-fade text-xs font-medium text-[#FF486E] hover:underline"
              onClick={() => setIsRouteExpanded(false)}
            >
              Hide Details
            </button>
          )}
        </div>
        {isRouteExpanded &&
          actions.map((action, i) => (
            <Fragment key={i}>
              {action.type === "SWAP" && (
                <SwapStep
                  action={action}
                  actions={actions}
                  statusData={statusData}
                />
              )}
              {action.type === "TRANSFER" && (
                <TransferStep
                  action={action}
                  actions={actions}
                  statusData={statusData}
                />
              )}
            </Fragment>
          ))}
        {!isRouteExpanded && (
          <div className="flex h-14 w-14 items-center justify-center">
            <button
              className="rounded-full border-2 border-neutral-200 bg-white p-1 text-neutral-400 transition-transform hover:scale-110"
              onClick={() => setIsRouteExpanded(true)}
            >
              <ExpandArrow className="h-4 w-4" />
            </button>
          </div>
        )}
        <RouteEnd
          amount={amountOut}
          symbol={destinationAsset?.recommendedSymbol ?? "UNKNOWN"}
          logo={destinationAsset?.logoURI ?? "UNKNOWN"}
          chain={destinationChain?.prettyName ?? ""}
        />
      </div>
    </div>
  );
};
