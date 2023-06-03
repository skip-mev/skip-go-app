/* eslint-disable @next/next/no-img-element */
"use client";

import { chainIDToChainlistURL, chainNameToChainlistURL } from "@/config";
import { Chain } from "@/solve/api";
import { useManager } from "@cosmos-kit/react";
import { Transition, Dialog } from "@headlessui/react";
import { FC, Fragment, useState } from "react";

interface Props {
  chain: Chain;
  chains: Chain[];
  onSelect: (chain: Chain) => void;
}

const ChainSelect: FC<Props> = ({ chain, chains, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { chainRecords } = useManager();

  const selectedChainRecord = chainRecords.find(
    (chainRecord) => chainRecord.chain.chain_id === chain.chainId
  );

  const sortedChains = chains
    .filter((c) => {
      return chainRecords.find(
        (chainRecord) => chainRecord.chain.chain_id === c.chainId
      );
    })
    .sort((a, b) => {
      if (a.chainName < b.chainName) {
        return -1;
      } else if (a.chainName > b.chainName) {
        return 1;
      } else {
        return 0;
      }
    });

  return (
    <Fragment>
      <button
        className="bg-zinc-700 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-600 h-16 inline-flex items-center rounded-md text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors w-full group"
        onClick={() => setIsOpen(true)}
      >
        <div className="px-4">
          <img
            alt={chain.chainName}
            src={`${chainNameToChainlistURL(
              chain.chainName
            )}/chainImg/_chainImg.svg`}
            className="w-9 h-9 rounded-full"
            onError={(error) => {
              error.currentTarget.src =
                "https://api.dicebear.com/6.x/shapes/svg";
            }}
          />
        </div>
        <span className="flex-1 text-left">
          {selectedChainRecord?.chain.pretty_name ?? chain.chainName}
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
              <Dialog.Panel className="mx-auto max-w-lg w-full rounded">
                <div className="flex flex-col h-full">
                  <div className="mb-8">
                    <Dialog.Title className="font-bold text-2xl">
                      Select Network
                    </Dialog.Title>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4">
                    {sortedChains.map((chain) => {
                      const chainRecord = chainRecords.find(
                        (chainRecord) =>
                          chainRecord.chain.chain_id === chain.chainId
                      );

                      const name =
                        chainRecord?.chain.pretty_name ?? chain.chainName;

                      return (
                        <div key={chain.chainId}>
                          <button
                            className="bg-zinc-800/50 hover:bg-zinc-800 active:bg-zinc-800/50 transition-colors flex items-center gap-4 p-4 rounded-lg w-full text-left"
                            onClick={() => {
                              onSelect(chain);
                              setIsOpen(false);
                            }}
                          >
                            <img
                              alt={chain.chainName}
                              className="w-16 h-16 rounded-full"
                              src={`${chainNameToChainlistURL(
                                chain.chainName
                              )}/chainImg/_chainImg.svg`}
                              onError={(error) => {
                                error.currentTarget.src =
                                  "https://api.dicebear.com/6.x/shapes/svg";
                              }}
                            />
                            <p className="font-bold">{name}</p>
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

export default ChainSelect;
