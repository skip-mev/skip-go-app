import { BigNumber } from "bignumber.js";
import { clsx } from "clsx";
import { formatUnits } from "ethers";
import { MouseEventHandler, useMemo } from "react";
import toast from "react-hot-toast";

import { AssetWithMetadata, useAssets } from "@/context/assets";
import { useSettingsStore } from "@/context/settings";
import { useAccount } from "@/hooks/useAccount";
import { useBalancesByChain } from "@/hooks/useBalancesByChain";
import { Chain } from "@/hooks/useChains";
import { formatPercent, formatUSD } from "@/utils/intl";
import {
  formatNumberWithCommas,
  formatNumberWithoutCommas,
} from "@/utils/number";

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
  const { assetsByChainID, getNativeAssets, getFeeDenom } = useAssets();

  const assets = useMemo(() => {
    if (!chain) {
      return getNativeAssets();
    }

    return assetsByChainID(chain.chainID);
  }, [assetsByChainID, chain, getNativeAssets]);

  const showChainInfo = chain ? false : true;

  const account = useAccount(context === "src" ? "source" : "destination");

  const { data: balances } = useBalancesByChain(
    account?.address,
    chain,
    assets,
  );

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

    let amount = new BigNumber(selectedAssetBalance);

    if (event.shiftKey) {
      onAmountChange?.(amount.toString());
      return;
    }

    const feeDenom = getFeeDenom(chain.chainID);

    // if selected asset is the fee denom, subtract the fee
    if (feeDenom && feeDenom.denom === asset.denom) {
      const { gas } = useSettingsStore.getState();

      const { gasPrice } = chain.feeAssets.find(
        (a) => a.denom === feeDenom.denom,
      )!;

      const fee = new BigNumber(gasPrice.average)
        .multipliedBy(gas)
        .shiftedBy(-(feeDenom.decimals ?? 6)); // denom decimals

      amount = amount.minus(fee);
      if (amount.isNegative()) {
        amount = new BigNumber(0);
        toast.error(
          <p>
            <strong>Insufficient Balance</strong>
            <br />
            You need to have at least ≈{fee.toString()} to accommodate gas fees.
          </p>,
        );
      }
    }

    onAmountChange?.(amount.toString());
  };

  return (
    <div
      className={clsx(
        "space-y-4 border border-neutral-200 p-4 rounded-lg transition-[border,shadow]",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
        "hover:border-neutral-300 hover:shadow-sm",
      )}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
        <div>
          <ChainSelect chain={chain} chains={chains} onChange={onChainChange} />
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
        {isLoading && (
          <SpinnerIcon className="absolute right-3 top-3 animate-spin h-4 w-4 text-neutral-300 z-10" />
        )}
        <input
          data-testid="amount"
          className={clsx(
            "w-full text-3xl font-medium h-10 tabular-nums",
            "focus:outline-none placeholder:text-neutral-300",
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
              let value = new BigNumber(
                formatNumberWithoutCommas(event.currentTarget.value) || "0",
              );
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
        <div className="flex items-center space-x-2 tabular-nums h-8">
          <p className="text-neutral-400 text-sm tabular-nums">
            {amountUSD ? formatUSD(amountUSD) : null}
          </p>
          {amountUSD !== undefined &&
          diffPercentage !== 0 &&
          context === "dest" ? (
            <p
              className={clsx(
                "text-sm tabular-nums",
                diffPercentage >= 0 ? "text-green-500" : "text-red-500",
              )}
            >
              ({formatPercent(diffPercentage)})
            </p>
          ) : null}
          <div className="flex-grow" />
          {showBalance && account?.address && asset && (
            <div className="text-neutral-400 text-sm flex items-center animate-slide-left-and-fade">
              <span className="mr-1">Balance:</span>
              <SimpleTooltip
                label={`${selectedAssetBalance} ${asset.recommendedSymbol}`}
              >
                <div
                  className={clsx(
                    "max-w-[16ch] truncate mr-2 tabular-nums",
                    "underline decoration-dotted underline-offset-4 cursor-help",
                  )}
                >
                  {formattedSelectedAssetBalance}
                </div>
              </SimpleTooltip>
              <button
                className={clsx(
                  "px-2 py-1 rounded-md uppercase font-semibold text-xs bg-[#FF486E] disabled:bg-red-200 text-white",
                  "transition-[transform,background] enabled:hover:scale-110 enabled:hover:rotate-2 disabled:cursor-not-allowed",
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
