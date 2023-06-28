/* eslint-disable @next/next/no-img-element */
// import { chainIDToChainlistName } from "@/utils/utils";
import * as Tooltip from "@radix-ui/react-tooltip";
import { chainIDToChainlistURL, chainNameToChainlistURL } from "@/config";
import { ChainRecord } from "@cosmos-kit/core";
import { useManager } from "@cosmos-kit/react";
import { Fragment } from "react";
import { Asset } from "./AssetSelect";

const LoadingIndicator: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center z-50">
    <div className="bg-zinc-900">
      <svg
        className="animate-spin h-5 w-5 inline-block text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  </div>
);

const NoPathIndicator: React.FC = () => (
  <div className="absolute inset-0 flex items-center justify-center z-50">
    <div className="bg-zinc-900 px-3">
      <div className="inline-flex gap-3 items-center px-3 py-2 bg-red-400/10 text-red-400 rounded-md border border-red-400/20">
        <p className="text-xs font-bold">No Path Found</p>
      </div>
    </div>
  </div>
);

interface Props {
  assets: Asset[];
  chainIDs: string[];
  loading?: boolean;
  noPathExists?: boolean;
}

const PathDisplay: React.FC<Props> = ({
  assets,
  chainIDs,
  loading,
  noPathExists,
}) => {
  const { chainRecords } = useManager();
  return (
    <div className="space-y-9">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="h-[1px] w-full border-b border-zinc-600" />
        </div>
        {loading && <LoadingIndicator />}
        {noPathExists && <NoPathIndicator />}
        <div className="absolute h-[105px] left-4 right-4 top-0 border border-t-0 border-zinc-600 border-dashed rounded-b-3xl"></div>
        <div className="flex items-center justify-between relative z-40">
          {chainIDs.map((chainID, index) => {
            const chain = chainRecords.find(
              ({ chain }) => chain.chain_id === chainID
            );

            return (
              <Fragment key={`${chainID}-${index}`}>
                {chain && (
                  <div className="first:pl-0 last:pr-0 py-2 bg-zinc-900 px-2">
                    <img
                      alt=""
                      className="w-8 h-8 rounded-full"
                      src={`${chainNameToChainlistURL(
                        chain.name
                      )}/chainImg/_chainImg.svg`}
                      onError={(error) => {
                        error.currentTarget.src =
                          "https://api.dicebear.com/6.x/shapes/svg";
                      }}
                    />
                  </div>
                )}
                {index !== chainIDs.length - 1 && (
                  <div className="bg-zinc-900 px-2 text-zinc-600">
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
                )}
              </Fragment>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-around relative z-50">
        {assets.map((asset, index) => (
          <Fragment key={`asset-${index}`}>
            <div className="bg-zinc-900 px-2 text-zinc-600">
              <img
                alt={asset.symbol}
                src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${asset.image}`}
                className="w-9 h-9 rounded-full"
                onError={(error) => {
                  error.currentTarget.src =
                    "https://api.dicebear.com/6.x/shapes/svg";
                }}
              />
            </div>
            {index !== assets.length - 1 && assets.length > 1 && (
              <div className="bg-zinc-900 px-2 text-zinc-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 4.5c1.215 0 2.417.055 3.604.162a.68.68 0 01.615.597c.124 1.038.208 2.088.25 3.15l-1.689-1.69a.75.75 0 00-1.06 1.061l2.999 3a.75.75 0 001.06 0l3.001-3a.75.75 0 10-1.06-1.06l-1.748 1.747a41.31 41.31 0 00-.264-3.386 2.18 2.18 0 00-1.97-1.913 41.512 41.512 0 00-7.477 0 2.18 2.18 0 00-1.969 1.913 41.16 41.16 0 00-.16 1.61.75.75 0 101.495.12c.041-.52.093-1.038.154-1.552a.68.68 0 01.615-.597A40.012 40.012 0 0110 4.5zM5.281 9.22a.75.75 0 00-1.06 0l-3.001 3a.75.75 0 101.06 1.06l1.748-1.747c.042 1.141.13 2.27.264 3.386a2.18 2.18 0 001.97 1.913 41.533 41.533 0 007.477 0 2.18 2.18 0 001.969-1.913c.064-.534.117-1.071.16-1.61a.75.75 0 10-1.495-.12c-.041.52-.093 1.037-.154 1.552a.68.68 0 01-.615.597 40.013 40.013 0 01-7.208 0 .68.68 0 01-.615-.597 39.785 39.785 0 01-.25-3.15l1.689 1.69a.75.75 0 001.06-1.061l-2.999-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

export default PathDisplay;
