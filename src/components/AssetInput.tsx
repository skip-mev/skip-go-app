import { ethers } from "ethers";
import { FC, Fragment, useMemo, useState } from "react";

import { AssetWithMetadata, useAssets } from "@/context/assets";
import { Chain } from "@/context/chains";
import Toast from "@/elements/Toast";
import { useAccount } from "@/hooks/useAccount";
import { getFee, useBalancesByChain } from "@/utils/utils";

import AssetSelect from "./AssetSelect";
import ChainSelect from "./ChainSelect";

interface Props {
  amount: string;
  onAmountChange?: (amount: string) => void;
  asset?: AssetWithMetadata;
  onAssetChange?: (asset: AssetWithMetadata) => void;
  chain?: Chain;
  onChainChange?: (chain: Chain) => void;
  chains: Chain[];
  showBalance?: boolean;
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

  const { data: balances, fetchStatus } = useBalancesByChain(
    address,
    chain,
    showBalance,
  );

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
              className={`w-full text-3xl font-medium ${
                amount === "0.0" ? "text-neutral-300" : "text-black"
              }`}
              data-testid="amount"
            >
              {amount}
            </p>
          )}
          {onAmountChange && (
            <input
              className="w-full text-3xl font-medium focus:outline-none placeholder:text-neutral-300"
              type="text"
              placeholder="0.0"
              value={amount}
              onChange={(e) => onAmountChange?.(e.target.value)}
            />
          )}
        </div>
        {showBalance && address && (
          <div className="flex items-center justify-between">
            {fetchStatus === "fetching" && (
              <div className="w-[100px] h-[20.5px] bg-neutral-100 animate-pulse" />
            )}
            {fetchStatus !== "fetching" && selectedAssetBalance && (
              <Fragment>
                <p className="text-sm font-medium text-neutral-400">
                  AVAILABLE:{" "}
                  <span className="text-neutral-700">
                    {selectedAssetBalance} {asset?.symbol}
                  </span>
                </p>
                <div>
                  <button
                    className="font-extrabold text-xs bg-neutral-400 text-white px-3 py-1 rounded-md transition-transform enabled:hover:scale-110 enabled:hover:rotate-2 disabled:cursor-not-allowed"
                    disabled={maxButtonDisabled}
                    onClick={() => {
                      if (!selectedAssetBalance || !chain || !asset) {
                        return;
                      }

                      const feeDenom = getFeeDenom(chain.chainID);

                      let amount = selectedAssetBalance;

                      // if selected asset is the fee denom, subtract the fee
                      if (feeDenom && feeDenom.denom === asset.denom) {
                        const fee = getFee(chain.chainID);

                        const feeInt = parseFloat(
                          ethers.formatUnits(fee, asset.decimals),
                        ).toFixed(asset.decimals);

                        amount = (
                          parseFloat(selectedAssetBalance) - parseFloat(feeInt)
                        ).toFixed(asset.decimals);
                      }

                      onAmountChange?.(amount);
                    }}
                  >
                    MAX
                  </button>
                </div>
              </Fragment>
            )}
          </div>
        )}
      </div>
      <Toast
        open={isError}
        setOpen={setIsError}
        description={`There was an error loading assets for ${chain?.prettyName}. Please try again.`}
      />
    </Fragment>
  );
};

export default AssetInput;
