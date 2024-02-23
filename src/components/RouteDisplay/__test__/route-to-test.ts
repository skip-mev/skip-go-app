export interface RouteArgs {
  direction: string;
  amount: string;
  sourceAsset: string;
  sourceAssetChainID: string;
  destinationAsset: string;
  destinationAssetChainID: string;
  swapVenue: undefined;
}

export const cosmosHubAtomToAkashAKT = {
  direction: "swap-in",
  amount: "1000000",
  sourceAsset: "uatom",
  sourceAssetChainID: "cosmoshub-4",
  destinationAsset: "uakt",
  destinationAssetChainID: "akashnet-2",
  swapVenue: undefined,
};

export const cosmoshubATOMToAkashATOM = {
  direction: "swap-in",
  amount: "1000000",
  sourceAsset: "uatom",
  sourceAssetChainID: "cosmoshub-4",
  destinationAsset: "ibc/2E5D0AC026AC1AFA65A23023BA4F24BB8DDF94F118EDC0BAD6F625BFC557CDED",
  destinationAssetChainID: "akashnet-2",
  swapVenue: undefined,
};

export const nobleUSDCToEthereumUSDC = {
  direction: "swap-in",
  amount: "11000000",
  sourceAsset: "uusdc",
  sourceAssetChainID: "noble-1",
  destinationAsset: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  destinationAssetChainID: "1",
  swapVenue: undefined,
};

export const cosmoshubATOMToArbitrumARB = {
  direction: "swap-in",
  amount: "11000000",
  sourceAsset: "uatom",
  sourceAssetChainID: "cosmoshub-4",
  destinationAsset: "0x912CE59144191C1204E64559FE8253a0e49E6548",
  destinationAssetChainID: "42161",
  swapVenue: undefined,
};

export const nobleUSDCtoInjectiveINJ = {
  direction: "swap-in",
  amount: "1000000",
  sourceAsset: "uusdc",
  sourceAssetChainID: "noble-1",
  destinationAsset: "inj",
  destinationAssetChainID: "injective-1",
  swapVenue: undefined,
};
