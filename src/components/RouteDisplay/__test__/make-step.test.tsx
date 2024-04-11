import { useBroadcastedTxsStatus } from "@/solve";
import { AllTheProviders, renderHook, waitFor } from "@/test";

import { makeActions } from "../make-actions";
import { makeStepState } from "../make-step-state";
import { cosmoshubATOMToAkashATOM } from "./route-to-test";
import { createRoute } from "./utils";

test("make-step: cosmoshub ATOM to Akash ATOM", async () => {
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
            txHash: "F793B9F1ABCA715FF4706004AA4E220E6F0E5BE79CA97D5FD799BF6FD27BE036",
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
