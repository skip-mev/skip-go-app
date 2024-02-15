import { RouteResponse } from "@skip-router/core";
import { Dispatch, Fragment, SetStateAction, useMemo } from "react";
import { formatUnits } from "viem";

import { useAssets } from "@/context/assets";
import { useChainByID } from "@/hooks/useChains";
import { useBroadcastedTxsStatus } from "@/solve";

import { ExpandArrow } from "../Icons/ExpandArrow";
import { BroadcastedTx } from "../TransactionDialog/TransactionDialogContent";
import { RouteEnd } from "./RouteEnd";
import { SwapAction, SwapStep } from "./SwapStep";
import { TransferAction, TransferStep } from "./TransferStep";

export type Action = TransferAction | SwapAction;

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

  const actions = useMemo(() => {
    const _actions: Action[] = [];

    let swapCount = 0;
    let transferCount = 0;
    let asset = route.sourceAssetDenom;

    route.operations.forEach((operation, i) => {
      if ("swap" in operation) {
        if ("swapIn" in operation.swap) {
          _actions.push({
            type: "SWAP",
            sourceAsset: operation.swap.swapIn.swapOperations[0].denomIn,
            destinationAsset:
              operation.swap.swapIn.swapOperations[operation.swap.swapIn.swapOperations.length - 1].denomOut,
            chain: operation.swap.swapIn.swapVenue.chainID,
            venue: operation.swap.swapIn.swapVenue.name,
            id: `swap-${swapCount}-${i}`,
          });

          asset = operation.swap.swapIn.swapOperations[operation.swap.swapIn.swapOperations.length - 1].denomOut;
        }

        if ("swapOut" in operation.swap) {
          _actions.push({
            type: "SWAP",
            sourceAsset: operation.swap.swapOut.swapOperations[0].denomIn,
            destinationAsset:
              operation.swap.swapOut.swapOperations[operation.swap.swapOut.swapOperations.length - 1].denomOut,
            chain: operation.swap.swapOut.swapVenue.chainID,
            venue: operation.swap.swapOut.swapVenue.name,
            id: `swap-${swapCount}-${i}`,
          });

          asset = operation.swap.swapOut.swapOperations[operation.swap.swapOut.swapOperations.length - 1].denomOut;
        }
        swapCount++;
        return;
      }

      if ("axelarTransfer" in operation) {
        _actions.push({
          type: "TRANSFER",
          asset,
          sourceChain: operation.axelarTransfer.fromChainID,
          destinationChain: operation.axelarTransfer.toChainID,
          id: `transfer-${transferCount}-${i}`,
          bridgeID: operation.axelarTransfer.bridgeID,
        });

        asset = operation.axelarTransfer.asset;
        transferCount++;
        return;
      }

      if ("cctpTransfer" in operation) {
        _actions.push({
          type: "TRANSFER",
          asset,
          sourceChain: operation.cctpTransfer.fromChainID,
          destinationChain: operation.cctpTransfer.toChainID,
          id: `transfer-${transferCount}-${i}`,
          bridgeID: operation.cctpTransfer.bridgeID,
        });

        asset = operation.cctpTransfer.burnToken;
        transferCount++;
        return;
      }

      const sourceChain = operation.transfer.chainID;

      let destinationChain = "";
      if (i === route.operations.length - 1) {
        destinationChain = route.destAssetChainID;
      } else {
        const nextOperation = route.operations[i + 1];
        if ("swap" in nextOperation) {
          if ("swapIn" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapIn.swapVenue.chainID;
          }

          if ("swapOut" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapOut.swapVenue.chainID;
          }
        } else if ("axelarTransfer" in nextOperation) {
          destinationChain = nextOperation.axelarTransfer.fromChainID;
        } else if ("cctpTransfer" in nextOperation) {
          destinationChain = nextOperation.cctpTransfer.fromChainID;
        } else {
          destinationChain = nextOperation.transfer.chainID;
        }
      }

      _actions.push({
        type: "TRANSFER",
        asset,
        sourceChain,
        destinationChain,
        id: `transfer-${transferCount}-${i}`,
        bridgeID: operation.transfer.bridgeID,
      });

      asset = operation.transfer.destDenom;
      transferCount++;
    });

    return _actions;
  }, [route]);

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
                  id={action.id}
                  statusData={statusData}
                />
              )}
              {action.type === "TRANSFER" && (
                <TransferStep
                  action={action}
                  actions={actions}
                  id={action.id}
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
              <ExpandArrow />
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
