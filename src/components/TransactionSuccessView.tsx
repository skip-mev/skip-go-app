import { CheckCircleIcon } from "@heroicons/react/20/solid";
import { RouteResponse } from "@skip-router/core";
import { FC } from "react";

import { useAssets } from "@/context/assets";
import { Chain, useChains } from "@/hooks/useChains";

import { RouteTransaction } from "./TransactionDialog/TransactionDialogContent";

const TransactionSuccessView: FC<{
  route: RouteResponse;
  onClose: () => void;
  transactions: RouteTransaction[];
}> = ({ route, onClose, transactions }) => {
  const { getAsset } = useAssets();
  const { data: chains } = useChains();

  const sourceAsset = getAsset(
    route.sourceAssetDenom,
    route.sourceAssetChainID,
  );
  const destinationAsset = getAsset(
    route.destAssetDenom,
    route.destAssetChainID,
  );

  if (!chains) {
    return null;
  }

  const sourceChain = chains.find(
    (c) => c.chainID === route.sourceAssetChainID,
  ) as Chain;
  const destinationChain = chains.find(
    (c) => c.chainID === route.destAssetChainID,
  ) as Chain;

  return (
    <div className="flex flex-col items-center h-full px-4 py-6 pt-28 overflow-y-auto scrollbar-hide">
      <div className="text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[100px] h-[100px]"
        >
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="font-bold text-3xl mb-4">
          {route.doesSwap ? "Swap" : "Transfer"} Successful
        </p>
      </div>
      <p className="font-medium text-neutral-400 pb-8 text-center">
        {route.doesSwap &&
          `Successfully swapped ${
            sourceAsset?.symbol ?? route.sourceAssetDenom
          } for ${destinationAsset?.symbol ?? route.destAssetDenom}`}
        {!route.doesSwap &&
          `Successfully transfered ${
            sourceAsset?.symbol ?? route.sourceAssetDenom
          } from ${sourceChain.prettyName} to ${destinationChain.prettyName}`}
      </p>
      <div className="flex-1 space-y-6 w-full">
        {transactions.map(({ explorerLink, txHash }, i) => (
          <div key={`tx-${i}`} className="flex items-center gap-4">
            <CheckCircleIcon className="text-emerald-400 w-7 h-7" />
            <div className="flex-1">
              <p className="font-semibold">Transaction {i + 1}</p>
            </div>
            <div>
              {explorerLink && txHash && (
                <a
                  className="text-sm font-bold text-[#FF486E] hover:underline"
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <span>
                      {txHash.slice(0, 6)}
                      ...
                      {txHash.slice(-6)}
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
          onClick={onClose}
        >
          {route.doesSwap ? "Swap" : "Transfer"} Again
        </button>
      </div>
    </div>
  );
};

export default TransactionSuccessView;
