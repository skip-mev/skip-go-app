/* eslint-disable @next/next/no-img-element */
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { FC, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/Dialog";
import { AssetWithMetadata } from "@/context/assets";

import AssetSelectContent from "./AssetSelectContent";

interface Props {
  asset?: AssetWithMetadata;
  assets?: AssetWithMetadata[];
  balances?: Record<string, string>;
  onChange?: (asset: AssetWithMetadata) => void;
  showChainInfo?: boolean;
}

const AssetSelect: FC<Props> = ({
  asset,
  assets,
  balances,
  onChange,
  showChainInfo,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>
        <button
          className="font-semibold text-left whitespace-nowrap bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-md flex items-center gap-2 px-4 py-2 sm:py-4 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!assets || assets.length === 0}
        >
          {asset && (
            <img
              alt={asset.symbol}
              className="w-6 h-6 rounded-full"
              src={asset.logoURI}
              onError={(e) =>
                (e.currentTarget.src =
                  "https://api.dicebear.com/6.x/shapes/svg")
              }
            />
          )}
          <div className="flex-1 min-w-0">
            {!asset && <span>Select Token</span>}
            {asset && <div className="truncate">{asset.symbol}</div>}
          </div>
          <div>
            <ChevronDownIcon className="h-4 w-4" />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
        <AssetSelectContent
          assets={assets}
          balances={balances ?? {}}
          onChange={onChange}
          onClose={() => setIsOpen(false)}
          showChainInfo={showChainInfo}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssetSelect;
