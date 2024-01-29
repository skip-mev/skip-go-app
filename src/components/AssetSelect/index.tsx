import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/Dialog";
import { AssetWithMetadata } from "@/context/assets";
import { cn } from "@/utils/ui";

import AssetSelectContent from "./AssetSelectContent";

interface Props {
  asset?: AssetWithMetadata;
  assets?: AssetWithMetadata[];
  balances?: Record<string, string>;
  onChange?: (asset: AssetWithMetadata) => void;
  showChainInfo?: boolean;
}

function AssetSelect({ asset, assets, balances, onChange, showChainInfo }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger>
        <button
          className={cn(
            "whitespace-nowrap text-left font-semibold",
            "flex w-full items-center gap-2 rounded-md bg-neutral-100 px-4 py-2 transition-colors sm:py-4",
            "border border-neutral-200 hover:border-neutral-300",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          disabled={!assets || assets.length === 0}
        >
          {asset && (
            <img
              alt={asset.recommendedSymbol}
              className="h-6 w-6 rounded-full"
              src={asset.logoURI}
              onError={(event) => (event.currentTarget.src = "https://api.dicebear.com/6.x/shapes/svg")}
            />
          )}
          <div className="min-w-0 flex-1">
            {!asset && <span>Select Token</span>}
            {asset && <div className="truncate">{asset.recommendedSymbol}</div>}
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
}

export default AssetSelect;
