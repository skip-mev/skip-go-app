import { useManager as useCosmosManager } from "@cosmos-kit/react";
import { BigNumber } from "bignumber.js";
import { ethers, formatUnits } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useAccount as useWagmiAccount,
  useNetwork as useWagmiNetwork,
  useSwitchNetwork as useWagmiSwitchNetwork,
} from "wagmi";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { AssetWithMetadata, useAssets } from "@/context/assets";
import { useAnyDisclosureOpen } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { trackWallet } from "@/context/track-wallet";
import { useAccount } from "@/hooks/useAccount";
import { useBalancesByChain } from "@/hooks/useBalancesByChain";
import { Chain, useChains } from "@/hooks/useChains";
import { useRoute } from "@/solve";
import { formatPercent, formatUSD } from "@/utils/intl";
import { gracefullyConnect } from "@/utils/wallet";

const DEFAULT_SRC_CHAIN_ID = "cosmoshub-4";
const PRICE_IMPACT_THRESHOLD = 0.1;

export function useSwapWidget() {
  /**
   * intentional manual hydration to prevent ssr mismatch
   * @see {useSwapFormStore}
   */
  useEffect(() => void useSwapFormStore.persist.rehydrate(), []);

  /////////////////////////////////////////////////////////////////////////////

  // #region -- core states and callbacks

  const { assetsByChainID, getFeeDenom } = useAssets();
  const { data: chains } = useChains();

  const srcAccount = useAccount("source");

  const { getWalletRepo } = useCosmosManager();
  const { connector } = useWagmiAccount();
  const { chain: evmChain } = useWagmiNetwork();
  const { switchNetworkAsync } = useWagmiSwitchNetwork();

  const [userTouchedDstAsset, setUserTouchedDstAsset] = useState(false);

  const {
    amountIn,
    amountOut,
    direction,
    destinationAsset: dstAsset,
    destinationChain: dstChain,
    sourceAsset: srcAsset,
    sourceChain: srcChain,
  } = useSwapFormStore();

  const amountInWei = useSwapFormStore((state) => {
    return getAmountWei(state.sourceAsset, state.amountIn);
  });

  const amountOutWei = useSwapFormStore((state) => {
    return getAmountWei(state.destinationAsset, state.amountOut);
  });

  const isAnyDisclosureOpen = useAnyDisclosureOpen();

  const {
    data: route,
    error: routeError,
    isError: routeIsError,
    isFetching: routeIsFetching,
  } = useRoute({
    direction: direction,
    amount: direction === "swap-in" ? amountInWei : amountOutWei,
    sourceAsset: srcAsset?.denom,
    sourceAssetChainID: srcAsset?.chainID,
    destinationAsset: dstAsset?.denom,
    destinationAssetChainID: dstAsset?.chainID,
    enabled: !isAnyDisclosureOpen,
  });

  const srcAssets = useMemo(() => {
    return assetsByChainID(srcChain?.chainID);

    // reason: only update when `srcChain?.chainID` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcChain?.chainID]);

  const { data: balances } = useBalancesByChain(srcAccount?.address, srcChain, srcAssets);

  const gasComputed = useSettingsStore((state) => state.gasComputed);
  const gasMultiplier = useSettingsStore((state) => state.gasMultiplier);

  // #endregion

  /////////////////////////////////////////////////////////////////////////////

  // #region -- variables

  const errorMessage = useMemo(() => {
    if (!routeError) return "";
    if (routeError instanceof Error) {
      return getRouteErrorMessage(routeError);
    }
    return String(routeError);
  }, [routeError]);

  const insufficientBalance = useMemo(() => {
    const asset = srcAsset;

    if (!asset || !balances) return false;

    const parsedAmount = parseFloat(amountIn);

    if (isNaN(parsedAmount)) return false;

    const balanceStr = balances[asset.denom] ?? "0";
    const balance = parseFloat(formatUnits(balanceStr, asset.decimals));

    if (gasComputed && parsedAmount + +gasComputed > balance) {
      return `You need to have at least more than ≈${gasComputed} to accommodate gas fees.`;
    }

    return parsedAmount > balance;
  }, [amountIn, balances, gasComputed, srcAsset]);

  const swapPriceImpactPercent = useMemo(() => {
    if (!route?.swapPriceImpactPercent) return undefined;
    return parseFloat(route.swapPriceImpactPercent) / 100;
  }, [route]);

  const priceImpactThresholdReached = useMemo(() => {
    if (!swapPriceImpactPercent) return false;
    return swapPriceImpactPercent > PRICE_IMPACT_THRESHOLD;
  }, [swapPriceImpactPercent]);

  const txsRequired = useMemo(() => {
    return route?.txsRequired ?? 0;
  }, [route]);

  const usdDiffPercent = useMemo(() => {
    if (!route) {
      return undefined;
    }

    if (!route.usdAmountIn || !route.usdAmountOut) {
      return undefined;
    }

    const usdAmountIn = parseFloat(route.usdAmountIn);
    const usdAmountOut = parseFloat(route.usdAmountOut);

    return (usdAmountOut - usdAmountIn) / usdAmountIn;
  }, [route]);

  const [routeWarningTitle, routeWarningMessage] = useMemo(() => {
    if (!route) {
      return [undefined, undefined];
    }

    if (!route.swapPriceImpactPercent && (!route.usdAmountIn || !route.usdAmountOut)) {
      return ["Low Information Trade", "We were unable to calculate the price impact of this route."];
    }

    if (usdDiffPercent && Math.abs(usdDiffPercent) > PRICE_IMPACT_THRESHOLD) {
      const amountInUSD = formatUSD(parseFloat(route.usdAmountIn ?? "0"));

      const amountOutUSD = formatUSD(parseFloat(route.usdAmountOut ?? "0"));

      const formattedUsdDiffPercent = formatPercent(Math.abs(usdDiffPercent));
      return [
        "Bad Trade Warning",
        `Your estimated output value (${amountOutUSD}) is ${formattedUsdDiffPercent} lower than your estimated input value (${amountInUSD}).`,
      ];
    }

    if (swapPriceImpactPercent && swapPriceImpactPercent > PRICE_IMPACT_THRESHOLD) {
      const formattedPriceImpact = formatPercent(swapPriceImpactPercent);
      return [
        "Bad Trade Warning",
        `Your swap is expected to execute at a ${formattedPriceImpact} worse price than the current estimated on-chain price. It's likely there's not much liquidity available for this swap.`,
      ];
    }

    return [undefined, undefined];
  }, [route, swapPriceImpactPercent, usdDiffPercent]);

  // #endregion

  /////////////////////////////////////////////////////////////////////////////

  // #region -- chain and asset handlers

  /**
   * Handle source chain change and update source asset with these cases:
   * - select fee denom asset if exists
   * - if not, select first available asset
   */
  const onSourceChainChange = useCallback(
    (chain: Chain) => {
      let asset = getFeeDenom(chain.chainID);
      if (!asset) {
        [asset] = assetsByChainID(chain.chainID);
      }
      useSwapFormStore.setState({
        sourceChain: chain,
        sourceAsset: asset,
      });
    },
    [assetsByChainID, getFeeDenom],
  );

  /**
   * Handle source asset change
   */
  const onSourceAssetChange = useCallback((asset: AssetWithMetadata) => {
    useSwapFormStore.setState({
      sourceAsset: asset,
    });
  }, []);

  /**
   * Handle destination chain change and update destination asset with these cases:
   * - if destination asset is user selected, find equivalent asset on new chain
   * - if not, select fee denom asset if exists
   * - if not, select first available asset
   */
  const onDestinationChainChange = useCallback(
    (chain: Chain) => {
      const { destinationAsset: currentDstAsset } = useSwapFormStore.getState();
      const assets = assetsByChainID(chain.chainID);

      let asset = getFeeDenom(chain.chainID);
      if (!asset) {
        [asset] = assets;
      }
      if (currentDstAsset && userTouchedDstAsset) {
        const equivalentAsset = findEquivalentAsset(currentDstAsset, assets);

        if (equivalentAsset) {
          asset = equivalentAsset;
        }
      }

      useSwapFormStore.setState({
        destinationChain: chain,
        destinationAsset: asset,
      });
    },

    [assetsByChainID, getFeeDenom, userTouchedDstAsset],
  );

  /**
   * Handle destination asset change with and update destination chain with these cases:
   * - if destination chain is undefined, select chain based off asset
   * - if destination chain is defined, only update destination asset
   */
  const onDestinationAssetChange = useCallback(
    (asset: AssetWithMetadata) => {
      // If destination asset is defined, but no destination chain, select chain based off asset.
      let { destinationChain: currentDstChain } = useSwapFormStore.getState();

      currentDstChain ??= (chains ?? []).find(({ chainID }) => {
        return chainID === asset.chainID;
      });

      // If destination asset is user selected, set flag to true.
      setUserTouchedDstAsset(true);

      useSwapFormStore.setState({
        destinationChain: currentDstChain,
        destinationAsset: asset,
      });
    },
    [chains],
  );

  // #endregion

  /////////////////////////////////////////////////////////////////////////////

  // #region -- side effects

  /**
   * compute gas amount on source chain change
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => state.sourceChain,
      (srcChain) => {
        if (srcChain?.chainType !== "cosmos") {
          useSettingsStore.setState({ gasComputed: undefined });
          return;
        }
        const feeDenom = getFeeDenom(srcChain.chainID);
        if (!feeDenom) return;
        const { gasPrice } = srcChain.feeAssets.find(({ denom }) => {
          return denom === feeDenom.denom;
        })!;
        useSettingsStore.setState({
          gasComputed: new BigNumber(gasPrice.average)
            .multipliedBy(gasMultiplier)
            .shiftedBy(-(feeDenom.decimals ?? 6))
            .toString(),
        });
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [gasMultiplier, getFeeDenom]);

  /**
   * sync either amount in or out depending on {@link direction}
   */
  useEffect(() => {
    if (!route) return;

    const isSwapIn = direction === "swap-in";

    const newAmount = isSwapIn ? route.amountOut : route.amountIn;

    const formattedNewAmount = isSwapIn
      ? parseAmountWei(newAmount, dstAsset?.decimals)
      : parseAmountWei(newAmount, srcAsset?.decimals);

    useSwapFormStore.setState(isSwapIn ? { amountOut: formattedNewAmount } : { amountIn: formattedNewAmount });
  }, [route, direction, srcAsset?.decimals, dstAsset?.decimals]);

  /**
   * if amount in is empty or zero, reset amount out
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => state.amountIn,
      (current, prev) => {
        if ((!current || current == "0") && prev) {
          useSwapFormStore.setState({ amountOut: "" });
        }
      },
    );
  }, []);

  /**
   * if amount out is empty or zero, reset amount in
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => state.amountOut,
      (current, prev) => {
        if ((!current || current == "0") && prev) {
          useSwapFormStore.setState({ amountIn: "" });
        }
      },
    );
  }, []);

  /**
   * prefill source chain with {@link DEFAULT_SRC_CHAIN_ID} and trigger
   * {@link onSourceChainChange} to sync source asset
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => [state.sourceChain, state.sourceAsset] as const,
      ([chain, asset]) => {
        if (!chain) {
          chain ??= (chains ?? []).find(({ chainID }) => {
            return chainID === DEFAULT_SRC_CHAIN_ID;
          });
        }
        if (chain && !asset) {
          onSourceChainChange(chain);
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [chains, onSourceChainChange]);

  /**
   * sync source chain wallet connections
   * @see {srcChain}
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => state.sourceChain,
      async (srcChain) => {
        const { source: srcTrack, destination: dstTrack } = trackWallet.get();

        if (srcChain && srcChain.chainType === "cosmos") {
          const { wallets } = getWalletRepo(srcChain.chainName);
          let wallet: (typeof wallets)[number] | undefined;
          if (srcTrack?.chainType === "cosmos") {
            wallet = wallets.find((w) => {
              return w.walletName === srcTrack.walletName;
            });
          } else if (dstTrack?.chainType === "cosmos") {
            wallet = wallets.find((w) => {
              return w.walletName === dstTrack.walletName;
            });
          } else {
            wallet = wallets.find((w) => {
              return w.isWalletConnected && !w.isWalletDisconnected;
            });
          }
          if (wallet) {
            try {
              await gracefullyConnect(wallet);
              trackWallet.track("source", srcChain.chainID, wallet.walletName, srcChain.chainType);
            } catch (error) {
              console.error(error);
            }
          } else {
            trackWallet.untrack("source");
          }
        }
        if (srcChain && srcChain.chainType === "evm") {
          if (evmChain && connector) {
            try {
              if (switchNetworkAsync && evmChain.id !== +srcChain.chainID) {
                await switchNetworkAsync(+srcChain.chainID);
              }
              trackWallet.track("source", srcChain.chainID, connector.id, srcChain.chainType);
            } catch (error) {
              console.error(error);
            }
          } else {
            trackWallet.untrack("source");
          }
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [connector, evmChain, getWalletRepo, switchNetworkAsync]);

  /**
   * sync destination chain wallet connections
   * @see {dstChain}
   */
  useEffect(() => {
    return useSwapFormStore.subscribe(
      (state) => state.destinationChain,
      async (dstChain) => {
        const { source: srcTrack, destination: dstTrack } = trackWallet.get();

        if (dstChain && dstChain.chainType === "cosmos") {
          const { wallets } = getWalletRepo(dstChain.chainName);
          let wallet: (typeof wallets)[number] | undefined;
          if (dstTrack?.chainType === "cosmos") {
            wallet = wallets.find((w) => {
              return w.walletName === dstTrack.walletName;
            });
          } else if (srcTrack?.chainType === "cosmos") {
            wallet = wallets.find((w) => {
              return w.walletName === srcTrack.walletName;
            });
          } else {
            wallet = wallets.find((w) => {
              return w.isWalletConnected && !w.isWalletDisconnected;
            });
          }
          if (wallet) {
            try {
              await gracefullyConnect(wallet);
              trackWallet.track("destination", dstChain.chainID, wallet.walletName, dstChain.chainType);
            } catch (error) {
              console.error(error);
            }
          } else {
            trackWallet.untrack("destination");
          }
        }
        if (dstChain && dstChain.chainType === "evm") {
          if (evmChain && connector) {
            try {
              if (switchNetworkAsync && evmChain.id !== +dstChain.chainID) {
                await switchNetworkAsync(+dstChain.chainID);
              }
              trackWallet.track("destination", dstChain.chainID, connector.id, dstChain.chainType);
            } catch (error) {
              console.error(error);
            }
          } else {
            trackWallet.untrack("destination");
          }
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [connector, evmChain, getWalletRepo, switchNetworkAsync]);

  /**
   * sync destination chain wallet connections on track wallet level
   * @see {trackWallet}
   */
  useEffect(() => {
    return trackWallet.subscribe(
      (state) => state.source,
      async (srcTrack) => {
        const { sourceChain: srcChain, destinationChain: dstChain } = useSwapFormStore.getState();
        const { destination: dstTrack } = trackWallet.get();
        if (
          srcChain?.chainType === "cosmos" &&
          srcTrack?.chainType === "cosmos" &&
          dstChain?.chainType === "cosmos" &&
          dstTrack?.chainType !== "cosmos"
        ) {
          const { wallets } = getWalletRepo(dstChain.chainName);
          const wallet = wallets.find((w) => {
            return w.walletName === srcTrack.walletName;
          });
          if (wallet) {
            try {
              await gracefullyConnect(wallet);
              trackWallet.track("destination", dstChain.chainID, wallet.walletName, dstChain.chainType);
            } catch (error) {
              console.error(error);
            }
          }
        }
        if (!srcTrack && dstChain?.chainType === "cosmos" && dstTrack?.chainType === "cosmos") {
          const { wallets } = getWalletRepo(dstChain.chainName);
          const wallet = wallets.find((w) => {
            return w.walletName === dstTrack.walletName;
          });
          if (wallet) {
            wallet.disconnect();
            trackWallet.untrack("destination");
          }
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [getWalletRepo]);

  // #endregion

  /////////////////////////////////////////////////////////////////////////////

  return {
    amountIn,
    amountOut,
    destinationAsset: dstAsset,
    destinationChain: dstChain,
    direction,
    insufficientBalance,
    noRouteFound: routeIsError,
    numberOfTransactions: txsRequired ?? 0,
    onDestinationAssetChange,
    onDestinationChainChange,
    onSourceAssetChange,
    onSourceChainChange,
    priceImpactThresholdReached,
    route,
    routeError: errorMessage,
    routeLoading: routeIsFetching,
    routeWarningMessage,
    routeWarningTitle,
    setFormValues: useSwapFormStore.setState,
    sourceAsset: srcAsset,
    sourceChain: srcChain,
    swapPriceImpactPercent,
  };
}

///////////////////////////////////////////////////////////////////////////////

// TODO: move to src/context/
// TODO: include all memoize values
export interface FormValues {
  amountIn: string;
  amountOut: string;
  sourceChain?: Chain;
  sourceAsset?: AssetWithMetadata;
  destinationChain?: Chain;
  destinationAsset?: AssetWithMetadata;
  direction: "swap-in" | "swap-out";
}

const defaultValues: FormValues = {
  amountIn: "",
  amountOut: "",
  direction: "swap-in",
};

// TODO: move to src/context/
// TODO: include all memoize values
const useSwapFormStore = create(
  subscribeWithSelector(
    persist(() => defaultValues, {
      name: "SwapWidgetState",
      version: 1,
      storage: createJSONStorage(() => window.sessionStorage),
      partialize: (state): Partial<FormValues> => ({
        amountIn: state.amountIn,
        amountOut: state.amountOut,
        sourceChain: state.sourceChain,
        sourceAsset: state.sourceAsset,
        destinationChain: state.destinationChain,
        destinationAsset: state.destinationAsset,
      }),
      skipHydration: true,
    }),
  ),
);

///////////////////////////////////////////////////////////////////////////////

function findEquivalentAsset(asset: AssetWithMetadata, assets: AssetWithMetadata[]) {
  return assets.find((a) => {
    const isSameOriginChain = a.originChainID === asset.originChainID;
    const isSameOriginDenom = a.originDenom === asset.originDenom;

    return isSameOriginChain && isSameOriginDenom;
  });
}

function getAmountWei(asset?: AssetWithMetadata, amount?: string) {
  if (!asset || !amount) return "0";
  try {
    return new BigNumber(amount.replace(/,/g, "")).shiftedBy(asset.decimals ?? 6).toFixed(0);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
    return "0";
  }
}

function parseAmountWei(amount?: string, decimals = 6) {
  if (!amount) return "0";
  try {
    return ethers.formatUnits(amount.replace(/,/g, ""), decimals ?? 6);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error(err);
    }
    return "0";
  }
}

function getRouteErrorMessage({ message }: { message: string }) {
  if (message.includes("no swap route found after axelar fee of")) {
    return "Amount is too low to cover Axelar fees";
  }
  if (message.includes("evm native destination tokens are currently not supported")) {
    return "EVM native destination tokens are currently not supported";
  }
  return "Route not found";
}
