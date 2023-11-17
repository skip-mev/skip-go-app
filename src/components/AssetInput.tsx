import { clsx } from "clsx";
import { ethers } from "ethers";
import { FC, Fragment, useEffect, useMemo, useRef, useState } from "react";

import { Chain } from "@/api/queries";
import { AssetWithMetadata, useAssets } from "@/context/assets";
import { disclosure } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import Toast from "@/elements/Toast";
import { useAccount } from "@/hooks/useAccount";
import { getFee, useBalancesByChain } from "@/utils/utils";

import AssetSelect from "./AssetSelect";
import ChainSelect from "./ChainSelect";
import { UsdDiff, UsdValue, useUsdDiffReset } from "./UsdValue";

interface Props {
  amount: string;
  onAmountChange?: (amount: string) => void;
  asset?: AssetWithMetadata;
  onAssetChange?: (asset: AssetWithMetadata) => void;
  chain?: Chain;
  onChainChange?: (chain: Chain) => void;
  chains: Chain[];
  showBalance?: boolean;
  showSlippage?: boolean;
}

const AssetInput: FC<Props> = ({
  amount,
  onAmountChange,
  asset,
  onAssetChange,
  chain,
  chains,
  onChainChange,
  showBalance,
  showSlippage,
}) => {
  const [isError, setIsError] = useState(false);

  const { assetsByChainID, getNativeAssets, getFeeDenom } = useAssets();

  const assets = useMemo(() => {
    if (!chain) {
      return getNativeAssets();
    }

    return assetsByChainID(chain.chainID);
  }, [assetsByChainID, chain, getNativeAssets]);

  const showChainInfo = chain ? false : true;

  const { address } = useAccount(chain?.chainID ?? "cosmoshub-4");

  const { data: balances } = useBalancesByChain(address, chain, showBalance);

  const selectedAssetBalance = useMemo(() => {
    if (!asset || !balances) {
      return undefined;
    }

    const balanceWei = balances[asset.denom];

    if (!balanceWei) {
      return "0.0";
    }

    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 6,
    }).format(parseFloat(ethers.formatUnits(balanceWei, asset.decimals)));
  }, [asset, balances]);

  const maxButtonDisabled = useMemo(() => {
    if (!selectedAssetBalance) {
      return true;
    }

    return selectedAssetBalance === "0.0";
  }, [selectedAssetBalance]);

  const { slippage } = useSettingsStore();

  const reset = useUsdDiffReset();
  useEffect(() => {
    const parsed = parseFloat(amount);

    // hotfix side effect to prevent negative amounts
    if (parsed < 0) onAmountChange?.("0.0");
    if (parsed == 0) reset();
  }, [amount, onAmountChange, reset]);

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => inputRef.current?.focus(), []);

  return (
    <Fragment>
      <div className="space-y-4 border border-neutral-200 p-4 rounded-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          {!onAmountChange && (
            <p
              className={clsx(
                "w-full text-3xl font-medium h-10",
                amount === "0.0" ? "text-neutral-300" : "text-black",
              )}
              data-testid="amount"
            >
              {amount}
            </p>
          )}
          {onAmountChange && (
            <input
              className="w-full text-3xl font-medium focus:outline-none placeholder:text-neutral-300 h-10 tabular-nums"
              type="text"
              placeholder="0.0"
              value={amount}
              inputMode="numeric"
              onChange={(e) => {
                let latest = e.target.value;

                // replace first comma with period
                latest = latest.replace(/^(\d+)[,]/, "$1.").replace(/^-/, "");

                // prevent entering anything except numbers, commas, and periods
                if (latest.match(/[^0-9.,]/gi)) return;

                // if there is more than one period or comma,
                // remove all periods except the first one for decimals
                if ((latest.match(/[.,]/g)?.length ?? 0) > 1) {
                  latest = latest.replace(/([,.].*)[,.]/g, "$1");
                }

                onAmountChange?.(latest);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  onAmountChange?.("");
                }
              }}
              ref={inputRef}
            />
          )}
          <div className="flex items-center space-x-2 tabular-nums h-8">
            {asset && parseFloat(amount) > 0 && (
              <div className="text-neutral-400 text-sm">
                <UsdValue
                  chainId={asset.originChainID}
                  denom={asset.originDenom}
                  value={amount}
                  context={onAmountChange ? "src" : "dest"}
                />
              </div>
            )}
            {!onAmountChange && (
              <UsdDiff.Value>
                {({ isLoading, percentage }) => (
                  <div
                    className={clsx(
                      "text-sm",
                      isLoading && "hidden",
                      percentage > 0 ? "text-green-500" : "text-red-500",
                    )}
                  >
                    ({percentage.toFixed(2)}%)
                  </div>
                )}
              </UsdDiff.Value>
            )}
            <div className="flex-grow" />
            {showBalance && address && selectedAssetBalance && (
              <div className="text-neutral-400 text-sm flex items-center space-x-2">
                <div className="max-w-[16ch] truncate">
                  Balance: {selectedAssetBalance}
                </div>
                <button
                  className={clsx(
                    "px-2 py-1 rounded-md uppercase font-semibold text-xs bg-[#FF486E] text-white",
                    "transition-transform enabled:hover:scale-110 enabled:hover:rotate-2 disabled:cursor-not-allowed",
                  )}
                  disabled={maxButtonDisabled}
                  onClick={() => {
                    if (!selectedAssetBalance || !chain || !asset) return;

                    const feeDenom = getFeeDenom(chain.chainID);

                    let amount = selectedAssetBalance;

                    // if selected asset is the fee denom, subtract the fee
                    if (feeDenom && feeDenom.denom === asset.denom) {
                      const fee = getFee(chain.chainID);

                      const feeInt = parseFloat(
                        ethers.formatUnits(fee.toString(), asset.decimals),
                      ).toFixed(asset.decimals);

                      amount = (
                        parseFloat(selectedAssetBalance) - parseFloat(feeInt)
                      ).toFixed(asset.decimals);
                    }

                    onAmountChange?.(amount);
                  }}
                >
                  Max
                </button>
              </div>
            )}
            {showSlippage && !onAmountChange && amount !== "0.0" && (
              <button
                className="text-neutral-400 text-sm hover:underline"
                onClick={() => disclosure.open("settingsDialog")}
              >
                Max Slippage: {slippage}%
              </button>
            )}
          </div>
        </div>
      </div>
      <Toast
        open={isError}
        setOpen={setIsError}
        description={`There was an error loading assets for ${chain?.chainName}. Please try again.`}
      />
    </Fragment>
  );
};

export default AssetInput;
