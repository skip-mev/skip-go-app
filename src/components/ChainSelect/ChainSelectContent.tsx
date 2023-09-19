/* eslint-disable @next/next/no-img-element */
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";

import { Chain } from "@/context/chains";

interface Props {
  chains: Chain[];
  onChange: (chain: Chain) => void;
  onClose: () => void;
}

const ChainSelectContent: FC<Props> = ({ chains, onChange, onClose }) => {
  const { width } = useWindowSize();

  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (width >= 768) {
      inputEl.current?.focus();
    }
  }, [width]);

  const [searchValue, setSearchValue] = useState("");

  const filteredChains = useMemo(() => {
    if (!searchValue) return chains;
    return chains.filter((chain) => {
      if (
        chain.chainID &&
        chain.chainID.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return true;
      }

      if (
        chain.chainName &&
        chain.chainName.toLowerCase().includes(searchValue.toLowerCase())
      ) {
        return true;
      }

      return chain.prettyName.toLowerCase().includes(searchValue.toLowerCase());
    });
  }, [chains, searchValue]);

  return (
    <div className="flex flex-col h-full px-4 py-6 space-y-6">
      <div>
        <div className="flex items-center gap-4">
          <button
            className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <p className="font-bold text-xl">Select Network</p>
        </div>
      </div>
      <div>
        <input
          className="w-full border p-4 rounded-md"
          type="text"
          placeholder="Search for a chain"
          onChange={(e) => setSearchValue(e.target.value)}
          value={searchValue}
          ref={inputEl}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        {chains.length === 0 ? (
          <div className="h-full flex justify-center pt-9">
            <svg
              className="animate-spin h-7 w-7 inline-block text-neutral-300"
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
        ) : (
          <div className="h-full overflow-y-auto scrollbar-hide">
            {filteredChains.map((chain) => {
              return (
                <button
                  className="flex text-left w-full items-center gap-4 hover:bg-[#ECD9D9] p-4 rounded-lg transition-colors"
                  key={chain.chainID}
                  onClick={() => {
                    onChange(chain);
                  }}
                >
                  <img
                    alt={chain.prettyName}
                    className="w-12 h-12 rounded-full"
                    src={
                      chain.logoURI || "https://api.dicebear.com/6.x/shapes/svg"
                    }
                  />
                  <div>
                    <p className="font-semibold text-lg">{chain.prettyName}</p>
                    <p className="text-sm text-neutral-500">{chain.chainID}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChainSelectContent;
