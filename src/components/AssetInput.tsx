import { BigNumber } from "bignumber.js";
import { clsx } from "clsx";
import { formatUnits } from "ethers";
import { MouseEventHandler, useMemo } from "react";

import { AssetWithMetadata, useAssets } from "@/context/assets";
import { useAnyDisclosureOpen } from "@/context/disclosures";
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
  onAmountMax?: MouseEventHandler<HTMLButtonElement>;
  asset?: AssetWithMetadata;
  onAssetChange?: (asset: AssetWithMetadata) => void;
  chain?: Chain;
  onChainChange?: (chain: Chain) => void;
  chains: Chain[];
  context: "source" | "destination";
  isError?: string | boolean;
  isLoading?: boolean;
}

function AssetInput({
  amount,
  amountUSD,
  diffPercentage = 0,
  onAmountChange,
  onAmountMax,
  asset,
  onAssetChange,
  chain,
  chains,
  onChainChange,
  context,
  isError,
  isLoading,
}: Props) {
  const { assetsByChainID, getNativeAssets } = useAssets();

  const assets = useMemo(() => {
    if (!chain) return getNativeAssets();
    return assetsByChainID(chain.chainID);
  }, [assetsByChainID, chain, getNativeAssets]);

  const account = useAccount(context);

  const isAnyDisclosureOpen = useAnyDisclosureOpen();

  const { data: balances } = useBalancesByChain({
    address: account?.address,
    chain,
    assets,
    enabled: !isAnyDisclosureOpen,
  });

  const selectedAssetBalance = useMemo(() => {
    if (!asset || !balances) return "0";
    return formatUnits(balances[asset.denom] ?? "0", asset.decimals ?? 6);
  }, [asset, balances]);

  const maxButtonDisabled = useMemo(() => {
    return parseFloat(selectedAssetBalance) <= 0;
  }, [selectedAssetBalance]);

  return (
    <div
      className={clsx(
        "rounded-lg border border-neutral-200 p-4 transition-[border,shadow]",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
        "hover:border-neutral-300 hover:shadow-sm",
        !!isError && "border-red-400 focus-within:border-red-500 hover:border-red-500",
      )}
    >
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4">
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
            showChainInfo={!!chain}
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
              if (event.currentTarget.selectionStart === event.currentTarget.selectionEnd) {
                event.currentTarget.select();
              }
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
          {amountUSD !== undefined && diffPercentage !== 0 && context === "destination" ? (
            <p className={clsx("text-sm tabular-nums", diffPercentage >= 0 ? "text-green-500" : "text-red-500")}>
              ({formatPercent(diffPercentage)})
            </p>
          ) : null}
          <div className="flex-grow" />
          {context === "source" && account?.address && asset && (
            <div className="flex animate-slide-left-and-fade items-center text-sm text-neutral-400">
              <span className="mr-1">Balance:</span>
              <SimpleTooltip label={`${parseFloat(selectedAssetBalance).toString()} ${asset.recommendedSymbol}`}>
                <div
                  className={clsx(
                    "mr-2 max-w-[16ch] truncate tabular-nums",
                    "cursor-help underline decoration-dotted underline-offset-4",
                  )}
                >
                  {parseFloat(selectedAssetBalance).toLocaleString("en-US", {
                    maximumFractionDigits: 4,
                  })}
                </div>
              </SimpleTooltip>
              <button
                className={clsx(
                  "rounded-md bg-[#FF486E] px-2 py-1 text-xs font-semibold uppercase text-white disabled:bg-red-200",
                  "transition-[transform,background] enabled:hover:rotate-2 enabled:hover:scale-110 disabled:cursor-not-allowed",
                )}
                disabled={maxButtonDisabled}
                onClick={onAmountMax}
              >
                Max
              </button>
            </div>
          )}
        </div>
      </div>
      {typeof isError === "string" && (
        <div className="mt-2 animate-slide-up-and-fade text-balance text-center text-xs font-medium text-red-500">
          {isError}
        </div>
      )}
    </div>
  );
}

export default AssetInput;
