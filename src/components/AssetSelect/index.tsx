/* eslint-disable @next/next/no-img-element */
import { FC, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Dialog, DialogContent, DialogTrigger } from "@/elements/Dialog";
import AssetSelectContent from "./AssetSelectContent";
import { AssetWithMetadata } from "@/context/assets";

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
          className="font-semibold text-left whitespace-nowrap bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-md flex items-center gap-2 p-4 w-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div className="flex-1">
            {!asset && <span>Select Token</span>}
            {asset && <span>{asset.symbol}</span>}
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
