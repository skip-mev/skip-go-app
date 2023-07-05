/* eslint-disable @next/next/no-img-element */
import { FC, Fragment, useMemo, useState } from "react";
import { Route } from "./TransactionDialog";
import { IBCHop, SwapRouteResponse } from "@/solve";
import { Chain, useChains } from "@/context/chains";
import { Asset, chainNameToChainlistURL } from "@/cosmos";
import { SWAP_VENUES } from "@/config";
import { useAssets } from "@/context/assets";

interface TransferAction {
  type: "TRANSFER";
  asset: string;
  sourceChain: string;
  destinationChain: string;
}

interface SwapAction {
  type: "SWAP";
  sourceAsset: string;
  destinationAsset: string;
  chain: string;
  venue: string;
}

type Action = TransferAction | SwapAction;

function getActionsFromSwapRoute(route: SwapRouteResponse) {
  const actions: Action[] = [];

  route.preSwapHops.forEach((hop, i) => {
    const asset =
      i === 0 ? route.sourceAsset.denom : route.preSwapHops[i - 1].destDenom;
    const sourceChain = hop.chainId;

    const destinationChain =
      i === route.preSwapHops.length - 1
        ? route.userSwap.swapVenue.chainId
        : route.preSwapHops[i + 1].chainId;

    actions.push({
      type: "TRANSFER",
      asset,
      sourceChain,
      destinationChain,
    });
  });

  for (const swap of route.userSwap.swapOperations) {
    actions.push({
      type: "SWAP",
      sourceAsset: swap.denomIn,
      destinationAsset: swap.denomOut,
      chain: route.userSwap.swapVenue.chainId,
      venue: route.userSwap.swapVenue.name,
    });
  }

  route.postSwapHops.forEach((hop, i) => {
    // console.log(hop);
    const asset =
      i === 0
        ? route.userSwap.swapOperations[
            route.userSwap.swapOperations.length - 1
          ].denomOut
        : route.postSwapHops[i - 1].destDenom;

    const sourceChain = hop.chainId;

    const destinationChain =
      i === route.postSwapHops.length - 1
        ? route.destAsset.chainId
        : route.postSwapHops[i + 1].chainId;

    actions.push({
      type: "TRANSFER",
      asset,
      sourceChain,
      destinationChain,
    });
  });

  return actions;
}

function getActionsFromTransferRoute(
  sourceAsset: Asset,
  sourceChain: Chain,
  destinationAsset: Asset,
  destinationChain: Chain,
  hops: IBCHop[]
) {
  const actions: Action[] = [];

  for (let i = 0; i < hops.length; i++) {
    const hop = hops[i];

    actions.push({
      type: "TRANSFER",
      asset: i === 0 ? sourceAsset.denom : hops[i - 1].destDenom,
      sourceChain: hop.chainId,
      destinationChain:
        i === hops.length - 1 ? destinationChain.chainId : hops[i + 1].chainId,
    });
  }

  return actions;
}

const RouteEnd: FC<{
  amount: string;
  symbol: string;
  chain: string;
  logo: string;
}> = ({ amount, symbol, logo, chain }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-white w-14 h-14 border-2 border-neutral-200 p-1.5 rounded-full">
        <img className="w-full h-full" src={logo} alt="Osmosis Logo" />
      </div>
      <div className="font-semibold">
        <p>
          {amount} {symbol}
        </p>
        <p className="text-sm text-neutral-400">On {chain}</p>
      </div>
    </div>
  );
};

const TransferStep: FC<{ action: TransferAction }> = ({ action }) => {
  const { chains } = useChains();

  const sourceChain = chains.find(
    (c) => c.chainId === action.sourceChain
  ) as Chain;

  const destinationChain = chains.find(
    (c) => c.chainId === action.destinationChain
  ) as Chain;

  const { getAsset } = useAssets();

  const asset = getAsset(action.asset, sourceChain.chainId);

  if (!asset) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-14 flex items-center justify-center">
        <div className="w-2 h-2 bg-neutral-200 rounded-full" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">
          Transfer{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={asset.image}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{asset.symbol}</span> from{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={`${chainNameToChainlistURL(
              sourceChain.chainName
            )}/chainImg/_chainImg.svg`}
            alt=""
          />{" "}
          <span className="font-semibold text-black">
            {sourceChain.prettyName}
          </span>{" "}
          to{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={`${chainNameToChainlistURL(
              destinationChain.chainName
            )}/chainImg/_chainImg.svg`}
            alt=""
          />{" "}
          <span className="font-semibold text-black">
            {destinationChain.prettyName}
          </span>
        </p>
      </div>
    </div>
  );
};

const SwapStep: FC<{ action: SwapAction }> = ({ action }) => {
  const { chains } = useChains();

  const chain = chains.find((c) => c.chainId === action.chain) as Chain;

  const { getAsset } = useAssets();

  const assetIn = getAsset(action.sourceAsset, chain.chainId);

  const assetOut = getAsset(action.destinationAsset, chain.chainId);

  const venue = SWAP_VENUES[action.venue];

  if (!assetIn || !assetOut) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-14 flex items-center justify-center">
        <div className="w-2 h-2 bg-neutral-200 rounded-full" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">
          Swap{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={assetIn.image}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{assetIn.symbol}</span> for{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={assetOut.image}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{assetOut.symbol}</span> on{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={venue.imageURL}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{venue.name}</span>
        </p>
      </div>
    </div>
  );
};

interface Props {
  route: Route;
}

const RouteDisplay: FC<Props> = ({ route }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    amountIn,
    amountOut,
    sourceAsset,
    sourceChain,
    destinationAsset,
    destinationChain,
  } = route;

  const actions = useMemo(() => {
    if (route.actionType === "SWAP") {
      return getActionsFromSwapRoute(route.data as SwapRouteResponse);
    }

    if (route.actionType === "TRANSFER") {
      return getActionsFromTransferRoute(
        sourceAsset,
        sourceChain,
        destinationAsset,
        destinationChain,
        route.data as IBCHop[]
      );
    }

    return [];
  }, [
    destinationAsset,
    destinationChain,
    route.actionType,
    route.data,
    sourceAsset,
    sourceChain,
  ]);

  return (
    <div className="relative h-full">
      <div className="absolute w-14 inset-y-0 z-0 py-7 flex justify-center items-center">
        <div className="w-0.5 h-full bg-neutral-200"></div>
      </div>
      <div className="relative flex flex-col gap-4 justify-between h-full">
        <div className="flex items-center justify-between pr-4">
          <RouteEnd
            amount={amountIn}
            symbol={sourceAsset.symbol}
            logo={sourceAsset.image}
            chain={sourceChain.prettyName}
          />
          {isExpanded && (
            <button
              className="text-xs font-medium text-[#FF486E] hover:underline"
              onClick={() => setIsExpanded(false)}
            >
              Hide Details
            </button>
          )}
        </div>
        {isExpanded &&
          actions.map((action, i) => (
            <Fragment key={i}>
              {action.type === "SWAP" && <SwapStep action={action} />}
              {action.type === "TRANSFER" && <TransferStep action={action} />}
            </Fragment>
          ))}
        {!isExpanded && (
          <div className="w-14 flex items-center justify-center h-14">
            <button
              className="bg-white text-neutral-400 border-2 border-neutral-200 rounded-full p-1 transition-transform hover:scale-110"
              onClick={() => setIsExpanded(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        )}
        <RouteEnd
          amount={amountOut}
          symbol={destinationAsset.symbol}
          logo={destinationAsset.image}
          chain={destinationChain.prettyName}
        />
      </div>
    </div>
  );
};

export default RouteDisplay;
