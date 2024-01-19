import { BigNumber } from "bignumber.js";
import { clsx } from "clsx";
import { formatUnits } from "ethers";
import { MouseEventHandler, useMemo } from "react";

import { AssetWithMetadata, useAssets } from "@/context/assets";
import { useSettingsStore } from "@/context/settings";
import { useAccount } from "@/hooks/useAccount";
import { useBalancesByChain } from "@/hooks/useBalancesByChain";
import { Chain } from "@/hooks/useChains";
import { formatPercent, formatUSD } from "@/utils/intl";
import { formatNumberWithCommas, formatNumberWithoutCommas } from "@/utils/number";

import AssetSelect from "./AssetSelect";
import ChainSelect from "./ChainSelect";
import { SimpleTooltip } from "./SimpleTooltip";
import { SpinnerIcon } from "./SpinnerIcon";

interface Props {
  amount: string;
  amountUSD?: string;
  diffPercentage?: number;
  onAmountChange?: (amount: string) => void;
  asset?: AssetWithMetadata;
  onAssetChange?: (asset: AssetWithMetadata) => void;
  chain?: Chain;
  onChainChange?: (chain: Chain) => void;
  chains: Chain[];
  showBalance?: boolean;
  context?: "src" | "dest";
  isLoading?: boolean;
}

function AssetInput({
  amount,
  amountUSD,
  diffPercentage = 0,
  onAmountChange,
  asset,
  onAssetChange,
  chain,
  chains,
  onChainChange,
  showBalance,
  context,
  isLoading,
}: Props) {
  const { assetsByChainID, getNativeAssets } = useAssets();

  const assets = useMemo(() => {
    if (!chain) {
      return getNativeAssets();
    }

    return assetsByChainID(chain.chainID);
  }, [assetsByChainID, chain, getNativeAssets]);

  const showChainInfo = chain ? false : true;

  const account = useAccount(context === "src" ? "source" : "destination");

  const { data: balances } = useBalancesByChain(account?.address, chain, assets);

  const selectedAssetBalance = useMemo(() => {
    if (!asset || !balances) return 0;

    const balanceWei = balances[asset.denom];
    if (!balanceWei) return 0;

    return parseFloat(formatUnits(balanceWei, asset.decimals));
  }, [asset, balances]);

  const formattedSelectedAssetBalance = useMemo(() => {
    return selectedAssetBalance.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }, [selectedAssetBalance]);

  const maxButtonDisabled = useMemo(() => {
    return selectedAssetBalance <= 0;
  }, [selectedAssetBalance]);

  const handleMax: MouseEventHandler<HTMLButtonElement> = (event) => {
    if (!selectedAssetBalance || !chain || !asset) return;

    let balance = new BigNumber(selectedAssetBalance);

    if (event.shiftKey) {
      onAmountChange?.(balance.toString());
      return;
    }

    const { gasComputed } = useSettingsStore.getState();
    gasComputed && (balance = balance.minus(gasComputed));

    onAmountChange?.(balance.toString());
  };

  return (
    <div
      className={clsx(
        "space-y-4 rounded-lg border border-neutral-200 p-4 transition-[border,shadow]",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
        "hover:border-neutral-300 hover:shadow-sm",
      )}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
        <div>
          <ChainSelect
            chain={chain}
            chains={chains}
            onChange={onChainChange}
          />
        </div>
        <div>
          <AssetSelect
            asset={asset}
            assets={assets}
            balances={balances}
            onChange={onAssetChange}
            showChainInfo={showChainInfo}
          />
        </div>
      </div>
      <div className="relative isolate">
        {isLoading && <SpinnerIcon className="absolute right-3 top-3 z-10 h-4 w-4 animate-spin text-neutral-300" />}
        <input
          data-testid="amount"
          className={clsx(
            "h-10 w-full text-3xl font-medium tabular-nums",
            "placeholder:text-neutral-300 focus:outline-none",
            isLoading && "animate-pulse text-neutral-500",
          )}
          type="text"
          placeholder="0.0"
          value={formatNumberWithCommas(amount)}
          inputMode="numeric"
          onChange={(e) => {
            if (!onAmountChange) return;

            let latest = e.target.value;

            if (latest.match(/^[.,]/)) latest = `0.${latest}`; // Handle first character being a period or comma
            latest = latest.replace(/^[0]{2,}/, "0"); // Remove leading zeros
            latest = latest.replace(/[^\d.,]/g, ""); // Remove non-numeric and non-decimal characters
            latest = latest.replace(/[.]{2,}/g, "."); // Remove multiple decimals
            latest = latest.replace(/[,]{2,}/g, ","); // Remove multiple commas

            onAmountChange?.(formatNumberWithoutCommas(latest));
          }}
          onKeyDown={(event) => {
            if (!onAmountChange) return;

            if (event.key === "Escape") {
              onAmountChange?.("");
              return;
            }

            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              let value = new BigNumber(formatNumberWithoutCommas(event.currentTarget.value) || "0");
              if (event.key === "ArrowUp") {
                event.preventDefault();
                if (event.shiftKey) {
                  value = value.plus(10);
                } else if (event.altKey || event.ctrlKey || event.metaKey) {
                  value = value.plus(0.1);
                } else {
                  value = value.plus(1);
                }
              }
              if (event.key === "ArrowDown") {
                event.preventDefault();
                if (event.shiftKey) {
                  value = value.minus(10);
                } else if (event.altKey || event.ctrlKey || event.metaKey) {
                  value = value.minus(0.1);
                } else {
                  value = value.minus(1);
                }
              }
              if (value.isNegative()) {
                value = new BigNumber(0);
              }
              onAmountChange(value.toString());
            }
          }}
        />
        <div className="flex h-8 items-center space-x-2 tabular-nums">
          <p className="text-sm tabular-nums text-neutral-400">{amountUSD ? formatUSD(amountUSD) : null}</p>
          {amountUSD !== undefined && diffPercentage !== 0 && context === "dest" ? (
            <p className={clsx("text-sm tabular-nums", diffPercentage >= 0 ? "text-green-500" : "text-red-500")}>
              ({formatPercent(diffPercentage)})
            </p>
          ) : null}
          <div className="flex-grow" />
          {showBalance && account?.address && asset && (
            <div className="flex animate-slide-left-and-fade items-center text-sm text-neutral-400">
              <span className="mr-1">Balance:</span>
              <SimpleTooltip label={`${selectedAssetBalance} ${asset.recommendedSymbol}`}>
                <div
                  className={clsx(
                    "mr-2 max-w-[16ch] truncate tabular-nums",
                    "cursor-help underline decoration-dotted underline-offset-4",
                  )}
                >
                  {formattedSelectedAssetBalance}
                </div>
              </SimpleTooltip>
              <button
                className={clsx(
                  "rounded-md bg-[#FF486E] px-2 py-1 text-xs font-semibold uppercase text-white disabled:bg-red-200",
                  "transition-[transform,background] enabled:hover:rotate-2 enabled:hover:scale-110 disabled:cursor-not-allowed",
                )}
                disabled={maxButtonDisabled}
                onClick={handleMax}
              >
                Max
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssetInput;
