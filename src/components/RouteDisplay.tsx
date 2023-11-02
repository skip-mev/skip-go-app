/* eslint-disable @next/next/no-img-element */
import { RouteResponse } from "@skip-router/core";
import { ethers } from "ethers";
import { FC, Fragment, useMemo, useState } from "react";

import { useChainByID } from "@/api/queries";
import { useAssets } from "@/context/assets";
import { getChainLogo } from "@/cosmos";

export interface SwapVenueConfig {
  name: string;
  imageURL: string;
}

export const SWAP_VENUES: Record<string, SwapVenueConfig> = {
  "neutron-astroport": {
    name: "Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "osmosis-poolmanager": {
    name: "Osmosis",
    imageURL:
      "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/dappImg/app.png",
  },
};

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
  const { chain: sourceChain } = useChainByID(action.sourceChain);
  const { chain: destinationChain } = useChainByID(action.destinationChain);

  const { getAsset } = useAssets();

  const asset = getAsset(action.asset, action.sourceChain);

  if (!sourceChain || !destinationChain) {
    // this should be unreachable
    return null;
  }

  if (!asset) {
    return (
      <div className="flex items-center gap-2 justify-between">
        <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
          <div className="w-2 h-2 bg-neutral-200 rounded-full" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-neutral-500 break-all max-w-full">
            Transfer to{" "}
            <img
              className="inline-block w-4 h-4 -mt-1"
              src={getChainLogo(destinationChain)}
              alt=""
            />{" "}
            <span className="font-semibold text-black">
              {destinationChain.prettyName}
            </span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
        <div className="w-2 h-2 bg-neutral-200 rounded-full" />
      </div>
      <div>
        <p className="text-sm text-neutral-500">
          Transfer{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={asset.logoURI}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{asset.symbol}</span> from{" "}
          <img
            className="inline-block w-4 h-4 -mt-1 rounded-full"
            src={getChainLogo(sourceChain)}
            alt=""
            onError={(e) =>
              (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")
            }
          />{" "}
          <span className="font-semibold text-black">
            {sourceChain.prettyName}
          </span>{" "}
          to{" "}
          <img
            className="inline-block w-4 h-4 -mt-1 rounded-full"
            src={getChainLogo(destinationChain)}
            alt=""
            onError={(e) =>
              (e.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")
            }
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
  const { getAsset } = useAssets();

  const assetIn = getAsset(action.sourceAsset, action.chain);

  const assetOut = getAsset(action.destinationAsset, action.chain);

  const venue = SWAP_VENUES[action.venue];

  if (!assetIn && assetOut) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-14 h-14 flex items-center justify-center">
          <div className="w-2 h-2 bg-neutral-200 rounded-full" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">
            Swap to{" "}
            <img
              alt=""
              className="inline-block w-4 h-4 -mt-1"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://api.dicebear.com/6.x/shapes/svg")
              }
              src={assetOut.logoURI}
            />{" "}
            <span className="font-semibold text-black">{assetOut.symbol}</span>{" "}
            on{" "}
            <img
              alt=""
              className="inline-block w-4 h-4 -mt-1"
              onError={(e) =>
                (e.currentTarget.src =
                  "https://api.dicebear.com/6.x/shapes/svg")
              }
              src={venue.imageURL}
            />{" "}
            <span className="font-semibold text-black">{venue.name}</span>
          </p>
        </div>
      </div>
    );
  }

  if (assetIn && !assetOut) {
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
              src={assetIn.logoURI}
              alt=""
            />{" "}
            <span className="font-semibold text-black">{assetIn.symbol}</span>{" "}
            on{" "}
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
  }

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
            src={assetIn.logoURI}
            alt=""
          />{" "}
          <span className="font-semibold text-black">{assetIn.symbol}</span> for{" "}
          <img
            className="inline-block w-4 h-4 -mt-1"
            src={assetOut.logoURI}
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
  route: RouteResponse;
}

const RouteDisplay: FC<Props> = ({ route }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { getAsset } = useAssets();

  const sourceAsset = getAsset(
    route.sourceAssetDenom,
    route.sourceAssetChainID,
  );

  const destinationAsset = getAsset(
    route.destAssetDenom,
    route.destAssetChainID,
  );

  const { chain: sourceChain } = useChainByID(route.sourceAssetChainID);
  const { chain: destinationChain } = useChainByID(route.destAssetChainID);

  const amountIn = useMemo(() => {
    try {
      return ethers.formatUnits(route.amountIn, sourceAsset?.decimals ?? 6);
    } catch {
      return "0.0";
    }
  }, [route.amountIn, sourceAsset?.decimals]);

  const amountOut = useMemo(() => {
    try {
      return ethers.formatUnits(
        route.estimatedAmountOut ?? 0,
        destinationAsset?.decimals ?? 6,
      );
    } catch {
      return "0.0";
    }
  }, [route.estimatedAmountOut, destinationAsset?.decimals]);

  const actions = useMemo(() => {
    const _actions: Action[] = [];

    let asset = route.sourceAssetDenom;

    route.operations.forEach((operation, i) => {
      if ("swap" in operation) {
        if ("swapIn" in operation.swap) {
          _actions.push({
            type: "SWAP",
            sourceAsset: operation.swap.swapIn.swapOperations[0].denomIn,
            destinationAsset:
              operation.swap.swapIn.swapOperations[
                operation.swap.swapIn.swapOperations.length - 1
              ].denomOut,
            chain: operation.swap.swapIn.swapVenue.chainID,
            venue: operation.swap.swapIn.swapVenue.name,
          });

          asset =
            operation.swap.swapIn.swapOperations[
              operation.swap.swapIn.swapOperations.length - 1
            ].denomOut;
        }

        return;
      }

      if ("axelarTransfer" in operation) {
        _actions.push({
          type: "TRANSFER",
          asset,
          sourceChain: operation.axelarTransfer.fromChainID,
          destinationChain: operation.axelarTransfer.toChainID,
        });

        asset = operation.axelarTransfer.asset;

        return;
      }

      const sourceChain = operation.transfer.chainID;

      let destinationChain = "";
      if (i === route.operations.length - 1) {
        destinationChain = route.destAssetChainID;
      } else {
        const nextOperation = route.operations[i + 1];
        if ("swap" in nextOperation) {
          if ("swapIn" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapIn.swapVenue.chainID;
          }

          if ("swapOut" in nextOperation.swap) {
            destinationChain = nextOperation.swap.swapOut.swapVenue.chainID;
          }
        } else if ("axelarTransfer" in nextOperation) {
          destinationChain = nextOperation.axelarTransfer.toChain;
        } else {
          destinationChain = nextOperation.transfer.chainID;
        }
      }

      _actions.push({
        type: "TRANSFER",
        asset,
        sourceChain,
        destinationChain,
      });

      asset = operation.transfer.destDenom;
    });

    return _actions;
  }, [route]);

  return (
    <div className="relative h-full">
      <div className="absolute w-14 inset-y-0 z-0 py-7 flex justify-center items-center">
        <div className="w-0.5 h-full bg-neutral-200"></div>
      </div>
      <div className="relative flex flex-col gap-4 justify-between h-full">
        <div className="flex items-center justify-between pr-4">
          <RouteEnd
            amount={amountIn}
            symbol={sourceAsset?.symbol ?? "UNKNOWN"}
            logo={sourceAsset?.logoURI ?? "UNKNOWN"}
            chain={sourceChain?.prettyName ?? ""}
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
          symbol={destinationAsset?.symbol ?? "UNKNOWN"}
          logo={destinationAsset?.logoURI ?? "UNKNOWN"}
          chain={destinationChain?.prettyName ?? ""}
        />
      </div>
    </div>
  );
};

export default RouteDisplay;
