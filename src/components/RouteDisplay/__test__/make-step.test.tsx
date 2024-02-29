import { useBroadcastedTxsStatus } from "@/solve";
import { AllTheProviders, renderHook, waitFor } from "@/test";

import { makeActions } from "../make-actions";
import { makeStepState } from "../make-step-state";
import { nobleUSDCtoInjectiveINJ } from "./route-to-test";
import { createRoute } from "./utils";

test("make-step: Noble USDC to Injective INJ", async () => {
  const { direction, amount, sourceAsset, sourceAssetChainID, destinationAsset, destinationAssetChainID, swapVenue } =
    nobleUSDCtoInjectiveINJ;

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
            chainID: "noble-1",
            txHash: "40C220E06B22435842A1DDA80ED2D38917228D8A77419A9F4B885C9E48D6B228",
          },
        ],
        enabled: true,
      }),
    {
      wrapper: AllTheProviders,
    },
  );

  await waitFor(() => expect(result.current.isLoading).toBeFalsy(), {
    timeout: 10000,
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
});
