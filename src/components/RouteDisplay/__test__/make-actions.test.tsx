import { makeActions } from "../make-actions";
import {
  cosmosHubAtomToAkashAKT,
  cosmoshubATOMToAkashATOM,
  cosmoshubATOMToArbitrumARB,
  nobleUSDCToEthereumUSDC,
  RouteArgs,
} from "./route-to-test";
import { createRoute } from "./utils";

const makeActionsTest = async (_route: RouteArgs) => {
  const { direction, amount, sourceAsset, sourceAssetChainID, destinationAsset, destinationAssetChainID, swapVenue } =
    _route;

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

  expect(actions).toBeTruthy();
  expect(actions.length).toBeGreaterThan(0);

  const totalActions = actions.length;

  actions.forEach((currentAction, i) => {
    const nextAction = i === totalActions - 1 ? undefined : actions[i + 1];
    const prevAction = i === 0 ? undefined : actions[i - 1];
    const bridgeId = (() => {
      if ("transfer" in route.operations[i]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return route.operations[i].transfer.bridgeID;
      }
      if ("axelarTransfer" in route.operations[i]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return route.operations[i].axelarTransfer.bridgeID;
      }
      if ("cctpTransfer" in route.operations[i]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return route.operations[i].cctpTransfer.bridgeID;
      }
      return undefined;
    })();
    if (currentAction.type === "TRANSFER") {
      expect(currentAction.bridgeID).toBe(bridgeId);
      if (actions.length === 1) {
        expect(currentAction.sourceChain).toBe(_route.sourceAssetChainID);
        expect(currentAction.asset).toBe(_route.sourceAsset);
        expect(currentAction.destinationChain).toBe(_route.destinationAssetChainID);
        return;
      }
      if (i === 0) {
        expect(currentAction.sourceChain).toBe(_route.sourceAssetChainID);
        expect(currentAction.asset).toBe(_route.sourceAsset);
        return;
      }
      if (nextAction) {
        if (nextAction.type === "SWAP") {
          expect(currentAction.destinationChain).toBe(nextAction.chain);
          return;
        }
        if (nextAction.type === "TRANSFER") {
          expect(currentAction.destinationChain).toBe(nextAction.sourceChain);
          return;
        }
      }
    }
    if (currentAction.type === "SWAP") {
      if (prevAction) {
        if (prevAction.type === "TRANSFER") {
          expect(currentAction.chain).toBe(prevAction.destinationChain);
          return;
        }
      }
    }
  });
  return actions;
};

test("make-actions: Cosmoshub ATOM -> Akash AKT", async () => {
  await makeActionsTest(cosmosHubAtomToAkashAKT);
});

test("make-actions: Cosmoshub ATOM to Akash ATOM", async () => {
  await makeActionsTest(cosmoshubATOMToAkashATOM);
});

test("make-actions: Noble USDC to Ethereum USDC", async () => {
  await makeActionsTest(nobleUSDCToEthereumUSDC);
});

test("make-actions: Cosmoshub ATOM to Arbitrum ARB", async () => {
  await makeActionsTest(cosmoshubATOMToArbitrumARB);
});
