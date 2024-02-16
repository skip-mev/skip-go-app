import { useBroadcastedTxsStatus } from "@/solve";
import { makeExplorerLink } from "@/utils/link";

import { Action } from ".";

export const makeOperationState = ({
  actions,
  action,
  statusData,
}: {
  actions: Action[];
  action: Action;
  statusData?: ReturnType<typeof useBroadcastedTxsStatus>["data"];
}) => {
  // operations from router and tx/status response are not one to one
  // tx/status only tracks transfer operations

  // format: <operationType>-<operationTypeIndex>-<operationIndex>
  const _id = action.id.split("-");
  const operationType = action.type;
  const operationTypeIndex = Number(_id[1]);
  const operationIndex = Number(_id[2]);

  // swap operation
  if (operationType === "SWAP") {
    // Swap operation is not tracked by tx/status
    // so we got the state from the previous transfer operation
    // or next transfer operation if swap is the first operation
    // ┌───────────┐          ┌───────────┐
    // │ Transfer  │◀─┐       │   Swap    │──┐ (first operation)
    // └───────────┘  │       └───────────┘  │
    //                │ state                │ state
    // ┌───────────┐  │       ┌───────────┐  │
    // │   Swap    │──┘       │ Transfer  │◀─┘
    // └───────────┘          └───────────┘
    const isSwapFirstStep = operationIndex === 0 && operationTypeIndex === 0;
    const prevTransferOpIndex = Number(
      actions.find((x) => Number(x.id.split("-")[2]) === operationIndex - 1)?.id.split("-")[1],
    );
    const swapSequence = statusData?.transferSequence[isSwapFirstStep ? 0 : prevTransferOpIndex];
    const explorerLink = (() => {
      const tx = isSwapFirstStep ? swapSequence?.txs.sendTx : swapSequence?.txs.receiveTx;
      if (!tx) return;
      if (swapSequence?.state !== "TRANSFER_SUCCESS") return;
      return makeExplorerLink(tx.explorerLink);
    })();
    return {
      state: swapSequence?.state,
      explorerLink,
      operationIndex,
      operationTypeIndex,
    };
  }

  // transfer operation
  const isNextOpSwap =
    actions.find((x) => Number(x.id.split("-")[2]) === operationIndex + 1)?.id.split("-")[0] === "SWAP";
  const isPrevOpTransfer = actions[operationIndex - 1]?.type === "TRANSFER";
  const transferSequence = statusData?.transferSequence[operationTypeIndex];
  const explorerLink = (() => {
    const packetTx = (() => {
      if (operationIndex === 0) return transferSequence?.txs.sendTx;
      if (isNextOpSwap) return transferSequence?.txs.sendTx;
      if (isPrevOpTransfer) return transferSequence?.txs.sendTx;
      return transferSequence?.txs.receiveTx;
    })();
    if (!packetTx?.explorerLink) {
      return null;
    }
    return makeExplorerLink(packetTx.explorerLink);
  })();

  return {
    state: transferSequence?.state,
    explorerLink,
    operationIndex,
    operationTypeIndex,
  };
};
