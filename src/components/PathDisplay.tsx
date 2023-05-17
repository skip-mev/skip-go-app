/* eslint-disable @next/next/no-img-element */
import { chainIDToChainlistName } from "@/utils/utils";
import { ChainRecord } from "@cosmos-kit/core";
import { useManager } from "@cosmos-kit/react";
import { Fragment } from "react";

const HopDisplay: React.FC<{ chainID: string }> = ({ chainID }) => {
  const { chainRecords } = useManager();

  const chain = chainRecords.find(({ chain }) => chain.chain_id === chainID);
  return (
    <div
      className="inline-flex gap-3 items-center px-4 py-3 bg-zinc-800 rounded-md border border-zinc-700"
      key={chainID}
    >
      {chain && (
        <Fragment>
          <img
            alt=""
            className="w-8 h-8"
            src={`https://raw.githubusercontent.com/cosmostation/chainlist/7433f9672d2cf33870e505318ee1eb50f5d149c6/chain/${chainIDToChainlistName(
              chain.chain.chain_id
            )}/chainImg/_chainImg.svg`}
          />
          <p className="text-sm font-bold">{chain.chain.pretty_name}</p>
        </Fragment>
      )}
      {!chain && <p className="text-sm font-bold">{chainID}</p>}
    </div>
  );
};

interface Props {
  chainIDs: string[];
  loading?: boolean;
  noPathExists?: boolean;
}

const PathDisplay: React.FC<Props> = ({ chainIDs, loading, noPathExists }) => {
  const start = chainIDs[0];
  const end = chainIDs[chainIDs.length - 1];

  const middleHops = chainIDs.slice(1, chainIDs.length - 1);

  return (
    <div className="relative">
      <div className="flex items-center justify-between z-10 relative pb-6">
        <HopDisplay chainID={start} />
        <HopDisplay chainID={end} />
      </div>
      <div className="flex items-center justify-evenly relative h-16 z-10">
        {noPathExists ? (
          <div className="inline-flex gap-3 items-center px-4 py-3 bg-red-900 text-red-100 rounded-md border border-red-700">
            <p className="text-sm font-bold">No Path Found</p>
          </div>
        ) : loading ? (
          <div className="inline-flex gap-3 items-center px-4 py-3 bg-zinc-800 rounded-md border border-zinc-700">
            <div>
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
            <p className="text-sm font-bold">Finding Path...</p>
          </div>
        ) : (
          middleHops.map((chainID, i) => (
            <HopDisplay chainID={chainID} key={`${chainID}-${i}`} />
          ))
        )}
      </div>
      <div className="top-4 left-8 right-8 border-2 border-zinc-600 border-t-0 border-dashed rounded-3xl h-[100px] absolute z-0" />
    </div>
  );
};

export default PathDisplay;
