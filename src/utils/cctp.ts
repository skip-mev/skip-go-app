import { RouteResponse } from "@skip-router/core";

const knownBrokenCCTPLedgerChainIds = ["noble-1", "evmos_9001-2", "dymension_1100-1", "injective-1", "dimension_37-1"];

export const isCCTPLedgerBrokenInOperation = (route: RouteResponse) => {
  return route.operations.some(
    (operation) =>
      "cctpTransfer" in operation && knownBrokenCCTPLedgerChainIds.includes(operation.cctpTransfer.fromChainID),
  );
};
