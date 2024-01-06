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

import AssetSelect from "./AssetSelect";
import ChainSelect from "./ChainSelect";
import { SimpleTooltip } from "./SimpleTooltip";

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
  showSlippage?: boolean;
  context?: "src" | "dest";
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
}: Props) {
  const { assetsByChainID, getNativeAssets, getFeeDenom } = useAssets();

  const assets = useMemo(() => {
    if (!chain) {
      return getNativeAssets();
    }

    return assetsByChainID(chain.chainID);
  }, [assetsByChainID, chain, getNativeAssets]);

  const showChainInfo = chain ? false : true;

  const { address } = useAccount(chain?.chainID ?? "cosmoshub-4");

  const { data: balances } = useBalancesByChain(address, chain, assets);

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
      <div className="relative">
        <input
          data-testid="amount"
          className="w-full text-3xl font-medium focus:outline-none placeholder:text-neutral-300 h-10 tabular-nums"
          type="text"
          placeholder="0.0"
          value={amount}
          inputMode="numeric"
          onChange={(e) => {
            if (!onAmountChange) return;

            let latest = e.target.value;

            // replace first comma with period
            latest = latest.replace(/^(\d+)[,]/, "$1.").replace(/^-/, "");

            // prevent entering anything except numbers, commas, and periods
            if (latest.match(/[^0-9.]/gi)) return;

            // if there is more than one period or comma,
            // remove all periods except the first one for decimals
            if ((latest.match(/[.,]/g)?.length ?? 0) > 1) {
              latest = latest.replace(/([,.].*)[,.]/g, "$1");
            }

            onAmountChange?.(latest);
          }}
          onKeyDown={(event) => {
            if (!onAmountChange) return;

            if (event.key === "Escape") {
              onAmountChange?.("");
              return;
            }

            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              let value = new BigNumber(event.currentTarget.value || "0");
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
          {showBalance && address && asset && (
            <div className="text-neutral-400 text-sm flex items-center">
              <span className="mr-1">Balance:</span>
              <SimpleTooltip label={`${selectedAssetBalance} ${asset.symbol}`}>
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
