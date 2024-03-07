import { GasPrice } from "@cosmjs/stargate";
import { useManager as useCosmosManager } from "@cosmos-kit/react";
import { Asset, BridgeType } from "@skip-router/core";
import { BigNumber } from "bignumber.js";
import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { formatUnits } from "viem";
import {
  useAccount as useWagmiAccount,
  useDisconnect as useWagmiDisconnect,
  useNetwork as useWagmiNetwork,
  useSwitchNetwork as useWagmiSwitchNetwork,
} from "wagmi";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { EVMOS_GAS_AMOUNT, isChainIdEvmos } from "@/constants/gas";
import { useAssets } from "@/context/assets";
import { useAnyDisclosureOpen } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { trackWallet } from "@/context/track-wallet";
import { useAccount } from "@/hooks/useAccount";
import { useBalancesByChain } from "@/hooks/useBalancesByChain";
import { Chain, useChains } from "@/hooks/useChains";
import { useRoute, useSkipClient } from "@/solve";
import { getChainFeeAssets, getChainGasPrice } from "@/utils/chain.client";
import { formatPercent, formatUSD } from "@/utils/intl";
import { getAmountWei, parseAmountWei } from "@/utils/number";
import { gracefullyConnect } from "@/utils/wallet";

const DEFAULT_SRC_CHAIN_ID = "cosmoshub-4";
const PRICE_IMPACT_THRESHOLD = 0.1;

export function useSwapWidget() {
  /**
   * intentional manual hydration to prevent ssr mismatch
   * @see {useSwapWidgetStore}
   */
  useEffect(() => void useSwapWidgetStore.persist.rehydrate(), []);

  /////////////////////////////////////////////////////////////////////////////

  // #region -- core states

  const skipClient = useSkipClient();

  const { assetsByChainID, getFeeAsset } = useAssets();
  const { data: chains } = useChains();

  const srcAccount = useAccount("source");

  const { getWalletRepo } = useCosmosManager();
  const { connector } = useWagmiAccount();
  const { chain: evmChain } = useWagmiNetwork();
  const { switchNetworkAsync } = useWagmiSwitchNetwork({
    onError: (error) => {
      toast.error(`Network switch error: ${error.message}`);
    },
  });
  const { disconnect } = useWagmiDisconnect();

  const [userTouchedDstAsset, setUserTouchedDstAsset] = useState(false);

  const {
    amountIn,
    amountOut,
    bridges,
    destinationAsset: dstAsset,
    destinationChain: dstChain,
    direction,
    gasRequired,
    sourceAsset: srcAsset,
    sourceChain: srcChain,
    sourceFeeAsset: srcFeeAsset,
  } = useSwapWidgetStore();

  const amountInWei = useMemo(() => {
    return getAmountWei(amountIn, srcAsset?.decimals);
  }, [amountIn, srcAsset?.decimals]);

  const amountOutWei = useMemo(() => {
    return getAmountWei(amountOut, dstAsset?.decimals);
  }, [amountOut, dstAsset?.decimals]);

  const isAnyDisclosureOpen = useAnyDisclosureOpen();

  const shouldRouteLoad = useMemo(() => {
    const wei = parseFloat(direction === "swap-in" ? amountInWei : amountOutWei);
    const isValidWei = !isNaN(wei);
    return !isAnyDisclosureOpen && isValidWei;
  }, [amountInWei, amountOutWei, direction, isAnyDisclosureOpen]);

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
    enabled: shouldRouteLoad,
  });

  const srcAssets = useMemo(() => {
    return assetsByChainID(srcChain?.chainID);

    // reason: only update when `srcChain?.chainID` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcChain?.chainID]);

  const { data: balances } = useBalancesByChain({
    address: srcAccount?.address,
    chain: srcChain,
    assets: srcAssets,
    enabled: !isAnyDisclosureOpen,
  });

  const customGasAmount = useSettingsStore((state) => state.customGasAmount);

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

  const isAmountError = useMemo(() => {
    if (!amountIn || !balances || !srcAsset) {
      return false;
    }

    const parsedAmount = BigNumber(amountIn || "0");
    const parsedBalance = BigNumber(balances[srcAsset.denom] ?? "0").shiftedBy(-(srcAsset.decimals ?? 6));

    if (srcFeeAsset) {
      const parsedFeeBalance = BigNumber(balances[srcFeeAsset.denom] ?? "0").shiftedBy(-(srcFeeAsset.decimals ?? 6));
      const parsedGasRequired = BigNumber(gasRequired || "0");
      if (
        parsedGasRequired.gt(0) &&
        (srcFeeAsset.denom === srcAsset.denom
          ? parsedAmount.isGreaterThan(parsedBalance.minus(parsedGasRequired))
          : parsedFeeBalance.minus(parsedGasRequired).isLessThanOrEqualTo(0))
      ) {
        return `Insufficient balance. You need ≈${gasRequired} ${srcFeeAsset.recommendedSymbol} to accomodate gas fees.`;
      }
    }

    if (parsedAmount.isGreaterThan(parsedBalance)) {
      return `Insufficient balance.`;
    }

    return false;
  }, [amountIn, balances, gasRequired, srcAsset, srcFeeAsset]);

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
  }, [route?.txsRequired]);

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

  const onBridgeChange = useCallback((bridges: BridgeType[]) => {
    useSwapWidgetStore.setState({ bridges });
  }, []);

  /**
   * Handle source chain change and update source asset with these cases:
   * - select fee denom asset if exists
   * - if not, select first available asset
   */
  const onSourceChainChange = useCallback(
    async (chain: Chain) => {
      let feeAsset: Asset | undefined = undefined;
      if (chain.chainType === "cosmos") {
        feeAsset = await getFeeAsset(chain.chainID);
      }

      let asset = feeAsset;
      if (!asset) {
        const assets = assetsByChainID(chain.chainID);
        if (chain.chainType === "evm") {
          asset = assets.find((asset) => asset.denom.endsWith("-native"));
        }
        asset ??= assets[0];
      }

      useSwapWidgetStore.setState({
        sourceChain: chain,
        sourceAsset: asset,
        sourceFeeAsset: feeAsset,
        sourceGasPrice: undefined,
        gasRequired: undefined,
      });
    },
    [assetsByChainID, getFeeAsset],
  );

  /**
   * Handle source asset change
   */
  const onSourceAssetChange = useCallback((asset: Asset) => {
    useSwapWidgetStore.setState({
      sourceAsset: asset,
      sourceGasPrice: undefined,
      gasRequired: undefined,
    });
  }, []);

  /**
   * Handle source amount change
   */
  const onSourceAmountChange = useCallback((amount: string) => {
    useSwapWidgetStore.setState({ amountIn: amount, direction: "swap-in" });
  }, []);

  /**
   * Handle destination chain change and update destination asset with these cases:
   * - if destination asset is user selected, find equivalent asset on new chain
   * - if not, select fee denom asset if exists
   * - if not, select first available asset
   */
  const onDestinationChainChange = useCallback(
    async (chain: Chain) => {
      const { destinationAsset: currentDstAsset } = useSwapWidgetStore.getState();
      const assets = assetsByChainID(chain.chainID);

      let asset = await getFeeAsset(chain.chainID);
      if (!asset) {
        [asset] = assets;
      }
      if (currentDstAsset && userTouchedDstAsset) {
        const equivalentAsset = findEquivalentAsset(currentDstAsset, assets);

        if (equivalentAsset) {
          asset = equivalentAsset;
        }
      }

      useSwapWidgetStore.setState({
        destinationChain: chain,
        destinationAsset: asset,
      });
    },

    [assetsByChainID, getFeeAsset, userTouchedDstAsset],
  );

  /**
   * Handle destination asset change with and update destination chain with these cases:
   * - if destination chain is undefined, select chain based off asset
   * - if destination chain is defined, only update destination asset
   */
  const onDestinationAssetChange = useCallback(
    (asset: Asset) => {
      // If destination asset is defined, but no destination chain, select chain based off asset.
      let { destinationChain: currentDstChain } = useSwapWidgetStore.getState();

      currentDstChain ??= (chains ?? []).find(({ chainID }) => {
        return chainID === asset.chainID;
      });

      // If destination asset is user selected, set flag to true.
      setUserTouchedDstAsset(true);

      useSwapWidgetStore.setState({
        destinationChain: currentDstChain,
        destinationAsset: asset,
      });
    },
    [chains],
  );

  /**
   * Handle destination amount change
   */
  const onDestinationAmountChange = useCallback((amount: string) => {
    useSwapWidgetStore.setState({ amountOut: amount, direction: "swap-out" });
  }, []);

  /**
   * Handle invert source and destination values
   */
  const onInvertDirection = useCallback(async () => {
    const { destinationChain } = useSwapWidgetStore.getState();
    if (!destinationChain) return;

    let sourceFeeAsset: Asset | undefined = undefined;
    if (destinationChain.chainType === "cosmos") {
      sourceFeeAsset = await getFeeAsset(destinationChain.chainID);
    }

    useSwapWidgetStore.setState((prev) => ({
      sourceChain: prev.destinationChain,
      sourceAsset: prev.destinationAsset,
      destinationChain: prev.sourceChain,
      destinationAsset: prev.sourceAsset,
      amountIn: prev.amountOut,
      amountOut: prev.amountIn,
      direction: prev.direction === "swap-in" ? "swap-out" : "swap-in",
      sourceFeeAsset,
      sourceGasPrice: undefined,
      gasRequired: undefined,
    }));
  }, [getFeeAsset]);

  /**
   * Handle maxing amount in
   */
  const onSourceAmountMax = useCallback(
    <T extends HTMLElement>(event: MouseEvent<T>) => {
      if (!balances || !srcChain || !srcAsset) return false;

      const decimals = srcAsset.decimals ?? 6;
      const balance = balances[srcAsset.denom];

      /**
       * if no balance, set amount in to zero
       * (would be impossible since max button is disabled if no balance)
       */
      if (!balance) {
        useSwapWidgetStore.setState({
          amountIn: "0",
          direction: "swap-in",
        });
        return;
      }

      const isDifferentAsset = srcFeeAsset && srcFeeAsset.denom !== srcAsset.denom;
      const isNotCosmos = srcChain.chainType !== "cosmos";

      /**
       * override to max balances on these cases:
       * - shift key is pressed
       * - fee asset is different from source asset
       * - source chain is not cosmos
       */
      if (event.shiftKey || isDifferentAsset || isNotCosmos) {
        const newAmountIn = formatUnits(BigInt(balance), decimals);
        useSwapWidgetStore.setState({
          amountIn: newAmountIn,
          direction: "swap-in",
        });
        return;
      }

      /**
       * compensate gas fees if source asset is same as fee asset
       */
      if (gasRequired && srcFeeAsset && srcFeeAsset.denom === srcAsset.denom) {
        let newAmountIn = BigNumber(balance).shiftedBy(-decimals).minus(gasRequired);
        newAmountIn = newAmountIn.isNegative() ? BigNumber(0) : newAmountIn;
        useSwapWidgetStore.setState({
          amountIn: newAmountIn.toFixed(decimals),
          direction: "swap-in",
        });
        return;
      }

      // otherwise, max balance
      const newAmountIn = formatUnits(BigInt(balance), decimals);
      useSwapWidgetStore.setState({
        amountIn: newAmountIn,
        direction: "swap-in",
      });
    },
    [balances, gasRequired, srcAsset, srcChain, srcFeeAsset],
  );

  /**
   * Handle clearing amount values when all transactions are complete
   */
  const onAllTransactionComplete = useCallback(() => {
    useSwapWidgetStore.setState({
      amountIn: "",
      amountOut: "",
      direction: "swap-in",
    });
  }, []);

  // #endregion

  /////////////////////////////////////////////////////////////////////////////

  // #region -- side effects

  /**
   * compute gas amount on source chain change
   */
  useEffect(() => {
    return useSwapWidgetStore.subscribe(
      (state) => [state.sourceChain, state.sourceAsset, state.sourceFeeAsset] as const,
      async ([srcChain, srcAsset, srcFeeAsset]) => {
        if (!(srcChain?.chainType === "cosmos" && srcAsset)) return;

        let srcGasPrice = await getChainGasPrice(srcChain.chainID);

        if (!srcFeeAsset || srcFeeAsset.chainID !== srcChain.chainID) {
          if (srcGasPrice) {
            srcFeeAsset = assetsByChainID(srcChain.chainID).find(({ denom }) => {
              return denom === srcGasPrice!.denom;
            });
          } else {
            srcFeeAsset = await getFeeAsset(srcChain.chainID);
          }
        }

        if (!srcFeeAsset) {
          toast.error(`Unable to find gas asset for ${srcChain.chainName}`);
          return;
        }

        const decimals = srcFeeAsset.decimals ?? 6;

        let selectedGasPrice: BigNumber;
        const actualGasAmount = isChainIdEvmos(srcChain.chainID) ? EVMOS_GAS_AMOUNT : customGasAmount;

        if (srcGasPrice) {
          selectedGasPrice = BigNumber(srcGasPrice.amount.toString());
        } else {
          let feeDenomPrices = srcChain.feeAssets.find(({ denom }) => {
            return denom === srcFeeAsset?.denom;
          });

          feeDenomPrices ??= (await getChainFeeAssets(srcChain.chainID)).find(({ denom }) => {
            return denom === srcFeeAsset?.denom;
          });

          if (!feeDenomPrices) {
            toast.error(`Unable to find gas prices for ${srcFeeAsset.denom} on ${srcChain.chainName}`);
            return;
          }

          srcGasPrice = GasPrice.fromString(`${feeDenomPrices.gasPrice.average}${feeDenomPrices.denom}`);
          selectedGasPrice = BigNumber(feeDenomPrices.gasPrice.average);
        }

        const gasRequired = selectedGasPrice.multipliedBy(actualGasAmount).shiftedBy(-decimals).toString();

        useSwapWidgetStore.setState({
          gasRequired,
          sourceFeeAsset: srcFeeAsset,
          sourceGasPrice: srcGasPrice,
        });
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [assetsByChainID, customGasAmount, getFeeAsset, skipClient]);

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

    useSwapWidgetStore.setState(isSwapIn ? { amountOut: formattedNewAmount } : { amountIn: formattedNewAmount });
  }, [route, direction, srcAsset?.decimals, dstAsset?.decimals]);

  /**
   * if amount in is empty or zero, reset amount out
   */
  useEffect(() => {
    return useSwapWidgetStore.subscribe(
      (state) => state.amountIn,
      (current, prev) => {
        if ((!current || current == "0") && prev) {
          useSwapWidgetStore.setState({ amountOut: "" });
        }
      },
    );
  }, []);

  /**
   * if amount out is empty or zero, reset amount in
   */
  useEffect(() => {
    return useSwapWidgetStore.subscribe(
      (state) => state.amountOut,
      (current, prev) => {
        if ((!current || current == "0") && prev) {
          useSwapWidgetStore.setState({ amountIn: "" });
        }
      },
    );
  }, []);

  /**
   * prefill source chain with {@link DEFAULT_SRC_CHAIN_ID} and trigger
   * {@link onSourceChainChange} to sync source asset
   */
  useEffect(() => {
    return useSwapWidgetStore.subscribe(
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
    return useSwapWidgetStore.subscribe(
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
              trackWallet.untrack("source");
              disconnect();
            }
          } else {
            trackWallet.untrack("source");
            disconnect();
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
    return useSwapWidgetStore.subscribe(
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
              if (switchNetworkAsync && evmChain.id !== +dstChain.chainID && srcChain && srcChain.chainType !== "evm") {
                await switchNetworkAsync(+dstChain.chainID);
              }
              trackWallet.track("destination", dstChain.chainID, connector.id, dstChain.chainType);
            } catch (error) {
              console.error(error);
              trackWallet.untrack("destination");
              disconnect();
            }
          } else {
            trackWallet.untrack("destination");
            disconnect();
          }
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [connector, evmChain, getWalletRepo, srcChain, switchNetworkAsync]);

  /**
   * sync destination chain wallet connections on track wallet level
   * @see {trackWallet}
   */
  useEffect(() => {
    return trackWallet.subscribe(
      (state) => state.source,
      async (srcTrack) => {
        const { sourceChain: srcChain, destinationChain: dstChain } = useSwapWidgetStore.getState();
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
    bridges,
    destinationAsset: dstAsset,
    destinationChain: dstChain,
    direction,
    isAmountError,
    noRouteFound: routeIsError,
    numberOfTransactions: txsRequired ?? 0,
    onAllTransactionComplete,
    onBridgeChange,
    onDestinationAmountChange,
    onDestinationAssetChange,
    onDestinationChainChange,
    onInvertDirection,
    onSourceAmountChange,
    onSourceAmountMax,
    onSourceAssetChange,
    onSourceChainChange,
    priceImpactThresholdReached,
    route,
    routeError: errorMessage,
    routeLoading: routeIsFetching,
    routeWarningMessage,
    routeWarningTitle,
    sourceAsset: srcAsset,
    sourceChain: srcChain,
    sourceFeeAmount: gasRequired,
    sourceFeeAsset: srcFeeAsset,
    swapPriceImpactPercent,
  };
}

///////////////////////////////////////////////////////////////////////////////

// TODO: move to src/context/
// TODO: include all memoize values
export interface SwapWidgetStore {
  amountIn: string;
  amountOut: string;
  sourceChain?: Chain;
  sourceAsset?: Asset;
  sourceFeeAsset?: Asset;
  sourceGasPrice?: GasPrice;
  destinationChain?: Chain;
  destinationAsset?: Asset;
  direction: "swap-in" | "swap-out";
  gasRequired?: string;
  bridges: BridgeType[];
}

const defaultValues: SwapWidgetStore = {
  amountIn: "",
  amountOut: "",
  direction: "swap-in",
  bridges: [],
};

// TODO: move to src/context/
// TODO: include all memoize values
const useSwapWidgetStore = create(
  subscribeWithSelector(
    persist(() => defaultValues, {
      name: "SwapWidgetState",
      version: 2,
      storage: createJSONStorage(() => window.sessionStorage),
      skipHydration: true,
    }),
  ),
);

///////////////////////////////////////////////////////////////////////////////

function findEquivalentAsset(asset: Asset, assets: Asset[]) {
  return assets.find((a) => {
    const isSameOriginChain = a.originChainID === asset.originChainID;
    const isSameOriginDenom = a.originDenom === asset.originDenom;
    return isSameOriginChain && isSameOriginDenom;
  });
}

function getRouteErrorMessage({ message }: { message: string }) {
  if (message.includes("no swap route found after axelar fee of")) {
    return "Amount is too low to cover Axelar fees";
  }
  if (message.includes("evm native destination tokens are currently not supported")) {
    return "EVM native destination tokens are currently not supported";
  }
  return message;
}
