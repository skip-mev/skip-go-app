import { FC } from "react";

const ROUTE = {
  preSwapHops: [
    {
      port: "transfer",
      channel: "channel-24",
      chainId: "stride-1",
      pfmEnabled: false,
      destDenom: "ujuno",
    },
    {
      port: "transfer",
      channel: "channel-0",
      chainId: "juno-1",
      pfmEnabled: true,
      destDenom:
        "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    },
  ],
  postSwapHops: [
    {
      port: "transfer",
      channel: "channel-0",
      chainId: "osmosis-1",
      pfmEnabled: true,
      destDenom: "uatom",
    },
  ],
  chainIds: ["stride-1", "cosmoshub-4", "osmosis-1", "juno-1"],
  sourceAsset: {
    denom:
      "ibc/DA356E369C3E5CF6A9F1DCD99CE8ED55FBD595E676A5CF033CE784C060492D5A",
    chainId: "stride-1",
  },
  destAsset: {
    denom: "uatom",
    chainId: "cosmoshub-4",
  },
  amountIn: "1000000",
  userSwap: {
    swapVenue: {
      name: "osmosis-xcs",
      chainId: "osmosis-1",
    },
    swapOperations: [
      {
        pool: "498",
        denomIn:
          "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
        denomOut:
          "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
      },
    ],
    swapAmountIn: "1000000",
  },
  userSwapAmountOut: "27801",
  swapChainId: "osmosis-1",
  totalAffiliateFee:
    "0ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
};

const SwapDisplay: FC = () => {
  return (
    <div>
      <h1>SwapDisplay</h1>
    </div>
  );
};

export default SwapDisplay;
