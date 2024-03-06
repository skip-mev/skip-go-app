import { RouteResponse } from "@skip-router/core";

import { SwapAction } from "./SwapStep";
import { TransferAction } from "./TransferStep";

export type Action = TransferAction | SwapAction;

export const makeActions = ({ route }: { route: RouteResponse }): Action[] => {
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
          id: `SWAP-${swapCount}-${i}`,
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
          id: `SWAP-${swapCount}-${i}`,
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
        id: `TRANSFER-${transferCount}-${i}`,
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
        id: `TRANSFER-${transferCount}-${i}`,
        bridgeID: operation.cctpTransfer.bridgeID,
      });

      asset = operation.cctpTransfer.burnToken;
      transferCount++;
      return;
    }

    if ("hyperlaneTransfer" in operation) {
      _actions.push({
        type: "TRANSFER",
        asset,
        sourceChain: operation.hyperlaneTransfer.fromChainID,
        destinationChain: operation.hyperlaneTransfer.toChainID,
        id: `transfer-${transferCount}-${i}`,
        bridgeID: operation.hyperlaneTransfer.bridgeID,
      });

      asset = operation.hyperlaneTransfer.denomIn;
      transferCount++;
      return;
    }

    if ("bankSend" in operation) {
      _actions.push({
        type: "TRANSFER",
        asset,
        sourceChain: operation.bankSend.chainID,
        destinationChain: operation.bankSend.chainID,
        id: `transfer-${transferCount}-${i}`,
        bridgeID: "IBC",
      });

      asset = operation.bankSend.denom;
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
      } else if ("hyperlaneTransfer" in nextOperation) {
        destinationChain = nextOperation.hyperlaneTransfer.fromChainID;
      } else if ("bankSend" in nextOperation) {
        destinationChain = nextOperation.bankSend.chainID;
      } else {
        destinationChain = nextOperation.transfer.chainID;
      }
    }

    _actions.push({
      type: "TRANSFER",
      asset,
      sourceChain,
      destinationChain,
      id: `TRANSFER-${transferCount}-${i}`,
      bridgeID: operation.transfer.bridgeID,
    });

    asset = operation.transfer.destDenom;
    transferCount++;
  });

  return _actions;
};
