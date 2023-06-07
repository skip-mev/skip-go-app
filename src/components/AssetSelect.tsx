/* eslint-disable @next/next/no-img-element */
"use client";
import { Dialog, Transition } from "@headlessui/react";
import { ethers } from "ethers";
import { FC, Fragment, useMemo, useState } from "react";

export interface Asset {
  image: string;
  symbol: string;
  denom: string;
  decimals: number;
}

interface Props {
  asset: Asset;
  balances: Record<string, string>;
  assets: Asset[];
  onSelect: (asset: Asset) => void;
}

const AssetSelect: FC<Props> = ({ asset, assets, balances, onSelect }) => {
  const [searchValue, setSearchValue] = useState("");

  const [isOpen, setIsOpen] = useState(false);

  // ibc/116AC0D0B3AE76D5CEF80755CF5C5595ACDE68FC6A800279E2574BC0702D95AB

  const filteredAssets = useMemo(() => {
    const _filteredAssets = assets.filter((asset) => {
      if (!searchValue) {
        return true;
      }

      if (asset.denom.toLowerCase().includes(searchValue.toLowerCase())) {
        return true;
      }

      if (asset.symbol.toLowerCase().includes(searchValue.toLowerCase())) {
        return true;
      }

      return false;
    });

    if (_filteredAssets.length === 0) {
      return [
        {
          image: `${searchValue}.png`,
          symbol: searchValue,
          denom: searchValue,
          decimals: 6,
        },
      ];
    }

    return _filteredAssets;
  }, [assets, searchValue]);

  const sortedAssets = filteredAssets.sort((a, b) => {
    const aBalance = balances[a.denom]
      ? parseFloat(ethers.formatUnits(balances[a.denom], a.decimals))
      : 0;
    const bBalance = balances[b.denom]
      ? parseFloat(ethers.formatUnits(balances[b.denom], b.decimals))
      : 0;

    return bBalance - aBalance;
  });

  return (
    <Fragment>
      <button
        className="bg-zinc-700 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-600 h-16 inline-flex items-center rounded-md font-semibold text-lg shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors w-full group"
        onClick={() => setIsOpen(true)}
      >
        <div className="px-4">
          <img
            alt={asset.symbol}
            src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${asset.image}`}
            className="w-10 h-10 rounded-full"
            onError={(error) => {
              error.currentTarget.src =
                "https://api.dicebear.com/6.x/shapes/svg";
            }}
          />
        </div>
        <span className="flex-1 text-left whitespace-nowrap truncate">
          {asset.symbol}
        </span>
        <span className="px-4 text-zinc-500 group-hover:text-zinc-400 group-active:text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      </button>
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsOpen(false);
          }}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div
              className="fixed inset-0 bg-zinc-900 transition-opacity"
              aria-hidden="true"
            />
          </Transition.Child>

          <div className="fixed inset-0 flex justify-center p-4 py-24">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="mx-auto max-w-lg w-full rounded p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <Dialog.Title className="font-bold text-2xl">
                      Select Asset
                    </Dialog.Title>
                  </div>
                  <div className="pb-4">
                    <input
                      className="p-4 rounded-lg w-full bg-zinc-800/50 focus:ring-2 focus:ring-inset focus:ring-indigo-500 outline-none"
                      type="text"
                      placeholder="Search name or paste address"
                      onChange={(e) => setSearchValue(e.target.value.trim())}
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                    {sortedAssets.map((asset) => {
                      const balance = balances[asset.denom];

                      return (
                        <div key={asset.symbol}>
                          {/* bg-zinc-800/50 */}
                          <button
                            className=" hover:bg-zinc-800 active:bg-zinc-800/50 transition-colors flex items-center gap-4 p-4 rounded-lg w-full text-left"
                            onClick={() => {
                              onSelect(asset);
                              setIsOpen(false);
                            }}
                          >
                            <img
                              alt={asset.symbol}
                              className="w-16 h-16 rounded-full"
                              src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${asset.image}`}
                              onError={(error) => {
                                error.currentTarget.src =
                                  "https://api.dicebear.com/6.x/shapes/svg";
                              }}
                            />
                            <p className="font-bold flex-1 whitespace-nowrap truncate">
                              {asset.symbol}
                            </p>
                            {balance && (
                              <p className="text-sm text-white/40">
                                {parseFloat(
                                  ethers.formatUnits(balance, asset.decimals)
                                ).toFixed(4)}
                              </p>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </Fragment>
  );
};

export default AssetSelect;
