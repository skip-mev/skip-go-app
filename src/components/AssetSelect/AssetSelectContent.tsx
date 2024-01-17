import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import { formatUnits, toBigInt } from "ethers";
import { matchSorter } from "match-sorter";
import { useEffect, useMemo, useRef, useState } from "react";

import { AssetWithMetadata } from "@/context/assets";
import { formatMaxFraction } from "@/utils/intl";

interface Props {
  assets?: AssetWithMetadata[];
  balances: Record<string, string>;
  onChange?: (asset: AssetWithMetadata) => void;
  onClose: () => void;
  showChainInfo?: boolean;
}

function AssetSelectContent({
  assets = [],
  balances,
  onChange,
  onClose,
  showChainInfo,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  const [searchValue, setSearchValue] = useState("");

  const sortedAssets = useMemo(() => {
    return assets
      ?.sort((a, b) => {
        if (!a.recommendedSymbol) return 1;
        if (!b.recommendedSymbol) return -1;
        if (a.recommendedSymbol > b.recommendedSymbol) return 1;
        if (a.recommendedSymbol < b.recommendedSymbol) return -1;
        return 0;
      })
      .filter((asset) => {
        if (
          asset.originChainID === "sifchain-1" &&
          asset.originDenom !== "rowan"
        ) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        const balanceA = balances[a.denom] ? toBigInt(balances[a.denom]) : 0n;
        const balanceB = balances[b.denom] ? toBigInt(balances[b.denom]) : 0n;
        if (balanceA > balanceB) return -1;
        if (balanceA < balanceB) return 1;
        return 0;
      });
  }, [assets, balances]);

  const filteredAssets = useMemo(() => {
    if (!searchValue) return sortedAssets;
    return matchSorter(sortedAssets || [], searchValue, {
      keys: ["symbol", "denom"],
    });
  }, [searchValue, sortedAssets]);

  return (
    <div className="flex flex-col h-full p-6 pb-2 isolate">
      <div className="flex items-center gap-4 mb-4">
        <button
          className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          onClick={onClose}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <p className="font-bold text-xl">Select Token</p>
      </div>
      <input
        className="w-full border px-4 py-2 rounded-md z-20"
        type="text"
        placeholder="Search name or paste address"
        onChange={(e) => setSearchValue(e.target.value)}
        value={searchValue}
        ref={inputRef}
      />
      <ScrollArea.Root
        className={clsx(
          "overflow-hidden relative flex-grow isolate",
          "before:absolute before:top-0 before:inset-x-0 before:h-2 before:z-10",
          "before:bg-gradient-to-b before:from-white before:to-transparent",
          "after:absolute after:bottom-0 after:inset-x-0 after:h-2 after:z-10",
          "after:bg-gradient-to-t after:from-white before:to-transparent",
        )}
      >
        <ScrollArea.Viewport className="w-full h-full py-4">
          {filteredAssets.map((asset) => (
            <button
              key={`${asset.chainID}-${asset.denom}`}
              className="flex text-left w-full items-center gap-4 hover:bg-[#ECD9D9] p-4 rounded-xl transition-colors focus:-outline-offset-2"
              onClick={() => (onClose(), onChange?.(asset))}
            >
              <img
                alt={asset.recommendedSymbol}
                className="w-12 h-12 rounded-full"
                src={asset.logoURI}
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://api.dicebear.com/6.x/shapes/svg")
                }
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">
                  {asset.recommendedSymbol}
                </p>
                {showChainInfo && (
                  <p className="text-sm text-neutral-400">{asset.chainID}</p>
                )}
              </div>
              <div>
                {balances[asset.denom] && (
                  <p className="font-medium text-sm text-neutral-400">
                    {formatMaxFraction(
                      parseFloat(
                        formatUnits(balances[asset.denom], asset.decimals),
                      ),
                    )}
                  </p>
                )}
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
    </div>
  );
}

export default AssetSelectContent;
