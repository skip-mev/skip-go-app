import { useBroadcastedTxsStatus } from "@/solve";
import { AllTheProviders, renderHook, waitFor } from "@/test";

import { makeActions } from "../make-actions";
import { makeStepState } from "../make-step-state";
import { cosmoshubATOMToAkashATOM } from "./route-to-test";
import { createRoute } from "./utils";

test("make-step: Noble USDC to Injective INJ", async () => {
  const { direction, amount, sourceAsset, sourceAssetChainID, destinationAsset, destinationAssetChainID, swapVenue } =
    cosmoshubATOMToAkashATOM;

  const route = await createRoute(
    direction === "swap-in"
      ? {
          amountIn: amount,
          sourceAssetDenom: sourceAsset,
          sourceAssetChainID: sourceAssetChainID,
          destAssetDenom: destinationAsset,
          destAssetChainID: destinationAssetChainID,
          swapVenue,
          allowMultiTx: true,
          allowUnsafe: true,
          experimentalFeatures: ["cctp"],
        }
      : {
          amountOut: amount,
          sourceAssetDenom: sourceAsset,
          sourceAssetChainID: sourceAssetChainID,
          destAssetDenom: destinationAsset,
          destAssetChainID: destinationAssetChainID,
          swapVenue,
          allowMultiTx: true,
          allowUnsafe: true,
          experimentalFeatures: ["cctp"],
        },
  );
  const actions = makeActions({ route });
  const { result } = renderHook(
    () =>
      useBroadcastedTxsStatus({
        txsRequired: route.txsRequired,
        txs: [
          {
            chainID: "cosmoshub-4",
            txHash: "F1852511F30AE8F1EC95C494963FD0B00CA5CB1BB684F6FFB4B1DE34AF33C6B7",
          },
        ],
        enabled: true,
      }),
    {
      wrapper: AllTheProviders,
    },
  );
  await waitFor(() => expect(result.current.isLoading).toBeFalsy(), {
    timeout: 120000,
  });

  actions.forEach((action, i) => {
    const { explorerLink, operationIndex, operationTypeIndex, state } = makeStepState({
      action,
      actions,
      statusData: result.current.data,
    });
    expect(operationIndex).toEqual(i);
    expect(state).toBeDefined();
    expect(operationTypeIndex).toBeDefined();
    expect(explorerLink).toBeDefined();
  });
}, 120000);
