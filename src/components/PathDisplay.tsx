/* eslint-disable @next/next/no-img-element */
// import { chainIDToChainlistName } from "@/utils/utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import { chainIDToChainlistURL, chainNameToChainlistURL } from "@/config";
import { ChainRecord } from "@cosmos-kit/core";
import { useManager } from "@cosmos-kit/react";
import { Fragment } from "react";
import { Asset } from "./AssetSelect";

const HopDisplay: React.FC<{ chainID: string }> = ({ chainID }) => {
  const { chainRecords } = useManager();

  const chain = chainRecords.find(({ chain }) => chain.chain_id === chainID);
  return (
    // <div
    //   className="inline-flex gap-3 items-center px-4 py-3 bg-zinc-800 rounded-md border border-zinc-700"
    // >
    //   {chain && (
    //     <Fragment>
    // <img
    //   alt=""
    //   className="w-8 h-8 rounded-full"
    //   src={`${chainNameToChainlistURL(
    //     chain.name
    //   )}/chainImg/_chainImg.svg`}
    //   onError={(error) => {
    //     error.currentTarget.src =
    //       "https://api.dicebear.com/6.x/shapes/svg";
    //   }}
    // />
    //     </Fragment>
    //   )}
    //   {/* {!chain && <p className="text-sm font-bold">{chainID}</p>} */}
    // </div>
    // <div className="relative">

    // </div>
    <Tooltip.Provider>
      <Tooltip.Root delayDuration={0}>
        <Tooltip.Trigger>
          <img
            alt=""
            className="w-8 h-8 rounded-full"
            src={
              chain
                ? `${chainNameToChainlistURL(
                    chain.name
                  )}/chainImg/_chainImg.svg`
                : "https://api.dicebear.com/6.x/shapes/svg"
            }
            onError={(error) => {
              error.currentTarget.src =
                "https://api.dicebear.com/6.x/shapes/svg";
            }}
          />
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="bg-zinc-100 text-black rounded-lg p-1.5 px-3 text-xs font-semibold shadow TooltipContent z-50"
            side="bottom"
            sideOffset={6}
          >
            <p>{chain?.chain.pretty_name ?? chainID}</p>
            <Tooltip.Arrow className="fill-zinc-50" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

interface Props {
  asset: Asset;
  chainIDs: string[];
  loading?: boolean;
  noPathExists?: boolean;
}

const PathDisplay: React.FC<Props> = ({
  asset,
  chainIDs,
  loading,
  noPathExists,
}) => {
  const start = chainIDs[0];
  const end = chainIDs[chainIDs.length - 1];

  const middleHops = chainIDs.slice(1, chainIDs.length - 1);

  return (
    <div>
      <div className="relative">
        <div className="flex items-center justify-between z-10 relative">
          <HopDisplay chainID={start} />
          <div className="text-zinc-500 bg-zinc-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex items-center gap-3 pl-3 px-4 py-2 bg-zinc-800 rounded-lg border border-zinc-700">
            <img
              alt={asset.symbol}
              src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${asset.image}`}
              className="w-6 h6- rounded-full"
              onError={(error) => {
                error.currentTarget.src =
                  "https://api.dicebear.com/6.x/shapes/svg";
              }}
            />
            <p className="text-sm font-semibold">{asset.symbol}</p>
          </div>
          <div className="text-zinc-500 bg-zinc-900">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <HopDisplay chainID={end} />
        </div>
        <div className="inset-0 absolute z-0 px-2 flex items-center">
          <div className="w-full h-0.5 border-b-2 border-zinc-600 border-t-0 border-dashed" />
        </div>
        {middleHops.length > 0 && (
          <div className="top-4 left-3 right-3 border-2 border-zinc-600 border-t-0 border-dashed rounded-3xl h-[68px] absolute z-0" />
        )}
      </div>
      {middleHops.length > 0 && (
        <div className="flex items-center justify-evenly relative pt-6 z-10">
          {middleHops.map((chainID, i) => (
            <Fragment key={`${chainID}-${i}`}>
              <div className="text-zinc-500 bg-zinc-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <HopDisplay chainID={chainID} />
              {/* {middleHops.length > 1 && i !== middleHops.length - 1 && ( */}
              <div className="text-zinc-500 bg-zinc-900">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              {/* )} */}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};

export default PathDisplay;
