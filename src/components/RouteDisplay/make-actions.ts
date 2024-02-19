import { RouteResponse } from "@skip-router/core";

import { SwapAction } from "./SwapStep";
import { TransferAction } from "./TransferStep";

export type Action = TransferAction | SwapAction;

export const makeActions = ({ route }: { route: RouteResponse }): Action[] => {
  const result = route.operations.map((operation, i) => {
    const isFirstOperation = i === 0;
    const isLastOperation = i === route.operations.length - 1;
    const prevOperation = route.operations[i - 1];
    const nextOperation = route.operations[i + 1];

    const swapIndex =
      route.operations.slice(0, i + 1).reduce((acc, op) => {
        if ("swap" in op) {
          acc++;
        }
        return acc;
      }, 0) - 1;
    const transferIndex =
      route.operations.slice(0, i + 1).reduce((acc, op) => {
        if ("axelarTransfer" in op || "cctpTransfer" in op || "transfer" in op) {
          acc++;
        }
        return acc;
      }, 0) - 1;

    // Will be used in TRANSFER operation
    const transferAsset = (() => {
      if (isFirstOperation) {
        return route.sourceAssetDenom;
      }
      switch (true) {
        case "swap" in prevOperation && "swapIn" in prevOperation.swap: {
          return prevOperation.swap.swapIn.swapOperations[prevOperation.swap.swapIn.swapOperations.length - 1].denomOut;
        }
        case "swap" in prevOperation && "swapOut" in prevOperation.swap: {
          return prevOperation.swap.swapOut.swapOperations[prevOperation.swap.swapOut.swapOperations.length - 1]
            .denomOut;
        }
        case "axelarTransfer" in prevOperation: {
          return prevOperation.axelarTransfer.asset;
        }
        case "cctpTransfer" in prevOperation: {
          return prevOperation.cctpTransfer.burnToken;
        }
        case "transfer" in prevOperation: {
          return prevOperation.transfer.destDenom;
        }
      }
    })();

    // Will be used in TRANSFER operation
    const transferDestinationChain = (() => {
      if (isLastOperation) {
        return route.destAssetChainID;
      }
      switch (true) {
        case "swap" in nextOperation && "swapIn" in nextOperation.swap: {
          return nextOperation.swap.swapIn.swapVenue.chainID;
        }
        case "swap" in nextOperation && "swapOut" in nextOperation.swap: {
          return nextOperation.swap.swapOut.swapVenue.chainID;
        }
        case "axelarTransfer" in nextOperation: {
          return nextOperation.axelarTransfer.fromChainID;
        }
        case "cctpTransfer" in nextOperation: {
          return nextOperation.cctpTransfer.fromChainID;
        }
        case "transfer" in nextOperation: {
          return nextOperation.transfer.chainID;
        }
      }
    })();

    switch (true) {
      case "swap" in operation && "swapIn" in operation.swap: {
        const res: SwapAction = {
          type: "SWAP",
          sourceAsset: operation.swap.swapIn.swapOperations[0].denomIn,
          destinationAsset:
            operation.swap.swapIn.swapOperations[operation.swap.swapIn.swapOperations.length - 1].denomOut,
          chain: operation.swap.swapIn.swapVenue.chainID,
          venue: operation.swap.swapIn.swapVenue.name,
          id: `SWAP-${swapIndex}-${i}`,
        };
        return res;
      }
      case "swap" in operation && "swapOut" in operation.swap: {
        const res: SwapAction = {
          type: "SWAP",
          sourceAsset: operation.swap.swapOut.swapOperations[0].denomIn,
          destinationAsset:
            operation.swap.swapOut.swapOperations[operation.swap.swapOut.swapOperations.length - 1].denomOut,
          chain: operation.swap.swapOut.swapVenue.chainID,
          venue: operation.swap.swapOut.swapVenue.name,
          id: `SWAP-${swapIndex}-${i}`,
        };
        return res;
      }
      case "axelarTransfer" in operation: {
        const res: TransferAction = {
          type: "TRANSFER",
          bridgeID: operation.axelarTransfer.bridgeID,
          sourceChain: operation.axelarTransfer.fromChainID,
          destinationChain: operation.axelarTransfer.toChainID,
          asset: transferAsset || operation.axelarTransfer.asset,
          id: `TRANSFER-${transferIndex}-${i}`,
        };
        return res;
      }
      case "cctpTransfer" in operation: {
        const res: TransferAction = {
          type: "TRANSFER",
          bridgeID: operation.cctpTransfer.bridgeID,
          sourceChain: operation.cctpTransfer.fromChainID,
          destinationChain: operation.cctpTransfer.toChainID,
          asset: transferAsset || operation.cctpTransfer.burnToken,
          id: `TRANSFER-${transferIndex}-${i}`,
        };
        return res;
      }
      case "transfer" in operation && !!transferDestinationChain: {
        const res: TransferAction = {
          type: "TRANSFER",
          sourceChain: operation.transfer.chainID,
          destinationChain: transferDestinationChain,
          asset: transferAsset || operation.transfer.destDenom,
          id: `TRANSFER-${transferIndex}-${i}`,
          bridgeID: operation.transfer.bridgeID,
        };
        return res;
      }
    }
  });
  return result.filter((op) => op !== undefined) as Action[];
};
