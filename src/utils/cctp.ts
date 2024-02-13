import { RouteResponse } from "@skip-router/core";

import { knownBrokenCCTPLedgerChainIds } from "@/constants/cctp";

export const isCCTPLedgerBrokenInOperation = (route: RouteResponse) => {
  return route.operations.some(
    (operation) =>
      "cctpTransfer" in operation && knownBrokenCCTPLedgerChainIds.includes(operation.cctpTransfer.fromChainID),
  );
};
