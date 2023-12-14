import { ethers } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNetwork, useSwitchNetwork } from "wagmi";
import { subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn as create } from "zustand/traditional";

import { Chain, useChains } from "@/api/queries";
import { AssetWithMetadata, useAssets } from "@/context/assets";
import { useAccount } from "@/hooks/useAccount";
import { useRoute } from "@/solve";
import { useBalancesByChain } from "@/utils/utils";

export const LAST_SOURCE_CHAIN_KEY = "IBC_DOT_FUN_LAST_SOURCE_CHAIN";

export function useSwapWidget() {
  const {
    onSourceChainChange,
    onSourceAssetChange,
    onDestinationChainChange,
    onDestinationAssetChange,
  } = useFormValues();

  const amountInWei = useFormValuesStore((formValues) => {
    return getAmountWei(formValues.sourceAsset, formValues.amountIn);
  });

  const amountOutWei = useFormValuesStore((formValues) => {
    return getAmountWei(formValues.destinationAsset, formValues.amountOut);
  });

  const {
    amountIn,
    amountOut,
    direction,
    destinationAsset,
    destinationChain,
    sourceAsset,
    sourceChain,
  } = useFormValuesStore();

  const {
    data: routeResponse,
    fetchStatus: routeFetchStatus,
    isError: routeQueryIsError,
    error: routeQueryError,
  } = useRoute({
    direction: direction,
    amount: direction === "swap-in" ? amountInWei : amountOutWei,
    sourceAsset: sourceAsset?.denom,
    sourceAssetChainID: sourceAsset?.chainID,
    destinationAsset: destinationAsset?.denom,
    destinationAssetChainID: destinationAsset?.chainID,
    enabled: true,
  });

  const errorMessage = useMemo(() => {
    if (!routeQueryError) {
      return "";
    }

    if (routeQueryError instanceof Error) {
      if (
        routeQueryError.message.includes(
          "no swap route found after axelar fee of",
        )
      ) {
        return "Amount is too low to cover Axelar fees";
      }

      if (
        routeQueryError.message.includes(
          "evm native destination tokens are currently not supported",
        )
      ) {
        return "EVM native destination tokens are currently not supported";
      }

      return "Route not found";
    }

    return String(routeQueryError);
  }, [routeQueryError]);

  const numberOfTransactions = useMemo(() => {
    if (!routeResponse) {
      return 0;
    }

    return routeResponse.txsRequired;
  }, [routeResponse]);

  const routeLoading = useMemo(() => {
    return routeFetchStatus === "fetching";
  }, [routeFetchStatus]);

  useEffect(() => {
    if (!routeResponse || routeLoading) return;

    const newAmount =
      direction === "swap-in"
        ? routeResponse.amountOut
        : routeResponse.amountIn;

    const formattedNewAmount =
      direction === "swap-in"
        ? parseAmountWei(newAmount, destinationAsset?.decimals)
        : parseAmountWei(newAmount, sourceAsset?.decimals);

    useFormValuesStore.setState(
      direction === "swap-in"
        ? { amountOut: formattedNewAmount }
        : { amountIn: formattedNewAmount },
    );
  }, [
    routeResponse,
    routeLoading,
    direction,
    sourceAsset?.decimals,
    destinationAsset?.decimals,
  ]);

  const { address } = useAccount(sourceChain?.chainID ?? "cosmoshub-4");

  const { data: balances } = useBalancesByChain(address, sourceChain);

  const insufficientBalance = useMemo(() => {
    if (!sourceAsset || !balances) {
      return false;
    }

    const parsedAmountIn = parseFloat(amountIn);

    if (isNaN(parsedAmountIn)) {
      return false;
    }

    const balanceStr = balances[sourceAsset.denom] ?? "0";

    const balance = parseFloat(
      ethers.formatUnits(balanceStr, sourceAsset.decimals),
    );

    return parsedAmountIn > balance;
  }, [balances, amountIn, sourceAsset]);

  const { chain: currentEvmChain } = useNetwork();

  const { switchNetwork } = useSwitchNetwork();

  useEffect(() => {
    if (!sourceChain || sourceChain.chainType === "cosmos") {
      return;
    }

    if (!currentEvmChain || !switchNetwork) {
      return;
    }

    const chainID = parseInt(sourceChain.chainID);

    if (currentEvmChain.id !== chainID) {
      switchNetwork(chainID);
    }
  }, [currentEvmChain, sourceChain, switchNetwork]);

  return {
    amountIn,
    amountOut,
    direction,
    destinationAsset,
    destinationChain,
    sourceAsset,
    sourceChain,
    setFormValues: useFormValuesStore.setState,
    routeLoading,
    numberOfTransactions: numberOfTransactions ?? 0,
    route: routeResponse,
    insufficientBalance,
    onSourceChainChange,
    onSourceAssetChange,
    onDestinationChainChange,
    onDestinationAssetChange,
    noRouteFound: routeQueryIsError,
    routeError: errorMessage,
  };
}

export interface FormValues {
  amountIn: string;
  amountOut: string;
  sourceChain?: Chain;
  sourceAsset?: AssetWithMetadata;
  destinationChain?: Chain;
  destinationAsset?: AssetWithMetadata;
  direction: "swap-in" | "swap-out";
}

const useFormValuesStore = create(
  subscribeWithSelector<FormValues>(() => ({
    amountIn: "",
    amountOut: "",
    direction: "swap-in",
  })),
);

// useFormValues returns a set of form values that are used to populate the swap widget
// and handles logic regarding setting initial values based on local storage and other form values.
function useFormValues() {
  const { chains } = useChains();

  const { assetsByChainID, getFeeDenom } = useAssets();

  const [userSelectedDestinationAsset, setUserSelectedDestinationAsset] =
    useState(false);

  // Select initial source chain.
  // - If chainID exists in local storage, use that.
  // - Otherwise, default to cosmoshub-4.
  useEffect(() => {
    return useFormValuesStore.subscribe(
      (state) => state.sourceChain,
      (sourceChain) => {
        if (!sourceChain && (chains ?? []).length > 0) {
          const chainID =
            localStorage.getItem(LAST_SOURCE_CHAIN_KEY) ?? "cosmoshub-4";
          useFormValuesStore.setState({
            sourceChain: (chains ?? []).find(
              (chain) => chain.chainID === chainID,
            ),
          });
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [chains]);

  // When source chain changes, save to local storage.
  useEffect(() => {
    return useFormValuesStore.subscribe(
      (state) => state.sourceChain,
      (sourceChain) => {
        if (sourceChain) {
          localStorage.setItem(LAST_SOURCE_CHAIN_KEY, sourceChain.chainID);
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, []);

  // Select initial source asset.
  // - If fee denom exists for source chain, use that.
  // - Otherwise, default to first asset in list.
  useEffect(() => {
    return useFormValuesStore.subscribe(
      (state) => [state.sourceChain, state.sourceAsset] as const,
      ([sourceChain, sourceAsset]) => {
        if (sourceChain && !sourceAsset) {
          const feeAsset = getFeeDenom(sourceChain.chainID);

          if (feeAsset) {
            useFormValuesStore.setState({ sourceAsset: feeAsset });
          } else {
            const assets = assetsByChainID(sourceChain.chainID);
            if (assets.length > 0) {
              useFormValuesStore.setState({ sourceAsset: assets[0] });
            }
          }
        }
      },
      {
        equalityFn: shallow,
        fireImmediately: true,
      },
    );
  }, [assetsByChainID, getFeeDenom]);

  const onSourceChainChange = useCallback((chain: Chain) => {
    useFormValuesStore.setState({
      sourceChain: chain,
      sourceAsset: undefined,
      amountIn: "",
    });
  }, []);

  const onSourceAssetChange = useCallback((asset: AssetWithMetadata) => {
    useFormValuesStore.setState({
      sourceAsset: asset,
    });
  }, []);

  // When a new destination chain is selected, select a new destination asset:
  // - If there is a destination asset already selected, try to find the equivalent asset on the new chain.
  // - Otherwise, if fee denom exists for destination chain, use that.
  // - Otherwise, default to first asset in list.
  const onDestinationChainChange = useCallback(
    (chain: Chain) => {
      const formValues = useFormValuesStore.getState();
      const assets = assetsByChainID(chain.chainID);

      let destinationAsset = getFeeDenom(chain.chainID) ?? assets[0];
      if (formValues.destinationAsset && userSelectedDestinationAsset) {
        const equivalentAsset = findEquivalentAsset(
          formValues.destinationAsset,
          assets,
        );

        if (equivalentAsset) {
          destinationAsset = equivalentAsset;
        }
      }

      useFormValuesStore.setState({
        destinationChain: chain,
        destinationAsset,
      });
    },
    [assetsByChainID, getFeeDenom, userSelectedDestinationAsset],
  );

  const onDestinationAssetChange = useCallback(
    (asset: AssetWithMetadata) => {
      // If destination asset is defined, but no destination chain, select chain based off asset.
      let { destinationChain } = useFormValuesStore.getState();
      if (!destinationChain) {
        destinationChain = (chains ?? []).find(
          (c) => c.chainID === asset.chainID,
        );
      }

      // If destination asset is user selected, set flag to true.
      setUserSelectedDestinationAsset(true);

      useFormValuesStore.setState({
        destinationAsset: asset,
        destinationChain,
      });
    },
    [chains],
  );

  return {
    onSourceAssetChange,
    onSourceChainChange,
    onDestinationChainChange,
    onDestinationAssetChange,
  };
}

function findEquivalentAsset(
  asset: AssetWithMetadata,
  assets: AssetWithMetadata[],
) {
  return assets.find((a) => {
    const isSameOriginChain = a.originChainID === asset.originChainID;
    const isSameOriginDenom = a.originDenom === asset.originDenom;

    return isSameOriginChain && isSameOriginDenom;
  });
}

function getAmountWei(asset?: AssetWithMetadata, amount?: string) {
  if (!asset || !amount) return "0";
  try {
    return ethers.parseUnits(amount, asset.decimals).toString();
  } catch {
    return "0";
  }
}

function parseAmountWei(amount?: string, decimals = 6) {
  if (!amount) return "0";
  try {
    return ethers.formatUnits(amount, decimals ?? 6);
  } catch {
    return "0";
  }
}
