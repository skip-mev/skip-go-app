import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import { matchSorter } from "match-sorter";
import { useEffect, useMemo, useRef, useState } from "react";

import { Chain } from "@/hooks/useChains";
import { useWindowSize } from "@/hooks/useWindowSize";
import { getChainLogo } from "@/lib/cosmos";

interface Props {
  chains: Chain[];
  onChange: (chain: Chain) => void;
  onClose: () => void;
}

function ChainSelectContent({ chains, onChange, onClose }: Props) {
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
    return matchSorter(chains, searchValue, {
      keys: ["chainID", "chainName"],
    });
  }, [chains, searchValue]);

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-2">
      <div className="flex items-center gap-4 mb-4">
        <button
          className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <p className="font-bold text-xl">Select Network</p>
      </div>
      <input
        className="w-full border p-4 rounded-md"
        type="text"
        placeholder="Search for a chain"
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        ref={inputEl}
      />
      {chains.length < 1 ? (
        <div className="flex-grow flex justify-center pt-9">
          <svg
            className="animate-spin h-7 w-7 inline-block text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
        </div>
      ) : (
        <ScrollArea.Root
          className={clsx(
            "overflow-hidden relative flex-grow",
            "before:absolute before:top-0 before:inset-x-0 before:h-2 before:z-10",
            "before:bg-gradient-to-b before:from-white before:to-transparent",
            "after:absolute after:bottom-0 after:inset-x-0 after:h-2 after:z-10",
            "after:bg-gradient-to-t after:from-white before:to-transparent",
          )}
        >
          <ScrollArea.Viewport className="w-full h-full py-4">
            {filteredChains.map((chain) => (
              <button
                className="flex text-left w-full items-center gap-4 hover:bg-[#ECD9D9] p-4 rounded-xl transition-colors focus:-outline-offset-2"
                key={chain.chainID}
                onClick={() => onChange(chain)}
              >
                <img
                  alt={chain.prettyName}
                  className="w-12 h-12 rounded-full"
                  src={getChainLogo(chain)}
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://api.dicebear.com/6.x/shapes/svg")
                  }
                />
                <div>
                  <p className="font-semibold text-lg">{chain.prettyName}</p>
                  <p className="text-sm text-neutral-500">{chain.chainID}</p>
                </div>
              </button>
            ))}
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="z-20 flex select-none touch-none py-4 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="transition-colors flex-1 bg-neutral-500/50 hover:bg-neutral-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>
      )}
    </div>
  );
}

export default ChainSelectContent;
