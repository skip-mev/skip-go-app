import { useAssets } from "@/context/assets";
import { Chain, useChains } from "@/context/chains";
import {
  AssetWithMetadata,
  getNumberOfTransactionsFromRoute,
  useRoute,
  useSkipClient,
} from "@/solve";
import { useQuery } from "@tanstack/react-query";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";

export function useSwapWidget() {
  const skipClient = useSkipClient();

  const { formValues, setFormValues } = useFormValues();

  const amountInWei = useMemo(() => {
    if (!formValues.sourceAsset) {
      return "0";
    }

    try {
      return ethers
        .parseUnits(formValues.amountIn, formValues.sourceAsset.decimals)
        .toString();
    } catch (err) {
      return "0";
    }
  }, [formValues.amountIn, formValues.sourceAsset]);

  const {
    data: routeResponse,
    fetchStatus: routeFetchStatus,
    isError,
  } = useRoute(
    skipClient,
    amountInWei,
    formValues.sourceAsset?.denom,
    formValues.sourceAsset?.chain_id,
    formValues.destinationAsset?.denom,
    formValues.destinationAsset?.chain_id,
    true
  );

  const {
    data: numberOfTransactions,
    fetchStatus: numberOfTransactionsFetchStatus,
  } = useQuery({
    queryKey: ["solve-number-of-transactions", routeResponse],
    queryFn: () => {
      if (!routeResponse) {
        return 0;
      }

      return getNumberOfTransactionsFromRoute(routeResponse);
    },
    enabled: !!routeResponse,
  });

  const routeLoading = useMemo(() => {
    return (
      routeFetchStatus === "fetching" ||
      numberOfTransactionsFetchStatus === "fetching"
    );
  }, [numberOfTransactionsFetchStatus, routeFetchStatus]);

  const amountOut = useMemo(() => {
    if (!routeResponse) {
      return "0.0";
    }

    if (routeResponse.does_swap && routeResponse.estimated_amount_out) {
      return ethers.formatUnits(
        routeResponse.estimated_amount_out,
        formValues.destinationAsset?.decimals ?? 6
      );
    }

    return formValues.amountIn;
  }, [
    formValues.amountIn,
    formValues.destinationAsset?.decimals,
    routeResponse,
  ]);

  return {
    amountIn: formValues.amountIn,
    amountOut,
    destinationAsset: formValues.destinationAsset,
    destinationChain: formValues.destinationChain,
    formValues,
    setFormValues,
    sourceAsset: formValues.sourceAsset,
    sourceChain: formValues.sourceChain,
    routeLoading,
    numberOfTransactions: numberOfTransactions ?? 0,
    route: routeResponse,
  };
}

export interface FormValues {
  amountIn: string;
  sourceChain?: Chain;
  sourceAsset?: AssetWithMetadata;
  destinationChain?: Chain;
  destinationAsset?: AssetWithMetadata;
}

// useFormValues returns a set of form values that are used to populate the swap widget
// and handles logic regarding setting initial values based on local storage and other form values.
function useFormValues() {
  const { chains } = useChains();
  const { assetsByChainID, getFeeDenom } = useAssets();

  const [formValues, setFormValues] = useState<FormValues>({
    amountIn: "",
  });

  // Select initial source chain.
  // - If chainID exists in local storage, use that.
  // - Otherwise, default to cosmoshub-4.
  useEffect(() => {
    if (!formValues.sourceChain && chains.length > 0) {
      const chainID =
        localStorage.getItem("IBC_DOT_FUN__LAST_SOURCE_CHAIN") ?? "cosmoshub-4";
      setFormValues((values) => ({
        ...values,
        sourceChain: chains.find((chain) => chain.chain_id === chainID),
      }));
    }
  }, [chains, formValues.sourceChain]);

  // When source chain changes, save to local storage.
  useEffect(() => {
    if (formValues.sourceChain) {
      localStorage.setItem(
        "IBC_DOT_FUN__LAST_SOURCE_CHAIN",
        formValues.sourceChain.chain_id
      );
    }
  }, [formValues.sourceChain]);

  // Select initial source asset.
  // - If fee denom exists for source chain, use that.
  // - Otherwise, default to first asset in list.
  useEffect(() => {
    if (formValues.sourceChain && !formValues.sourceAsset) {
      const feeAsset = getFeeDenom(formValues.sourceChain.chain_id);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          sourceAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.sourceChain.chain_id);
        if (assets.length > 0) {
          setFormValues((values) => ({
            ...values,
            sourceAsset: assets[0],
          }));
        }
      }
    }
  }, [
    assetsByChainID,
    formValues.sourceAsset,
    formValues.sourceChain,
    getFeeDenom,
  ]);

  // If destination chain is defined, but no destination asset, select an initial destination asset.
  // - If fee denom exists for destination chain, use that.
  // - Otherwise, default to first asset in list.
  useEffect(() => {
    if (formValues.destinationChain && !formValues.destinationAsset) {
      const feeAsset = getFeeDenom(formValues.destinationChain.chain_id);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          destinationAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.destinationChain.chain_id);
        if (assets.length > 0) {
          setFormValues((values) => ({
            ...values,
            destinationAsset: assets[0],
          }));
        }
      }
    }
  }, [
    assetsByChainID,
    formValues.destinationAsset,
    formValues.destinationChain,
    getFeeDenom,
  ]);

  // If destination asset is defined, but no destination chain, select chain based off asset.
  useEffect(() => {
    if (formValues.destinationAsset && !formValues.destinationChain) {
      const chain = chains.find(
        (c) => c.chain_id === formValues.destinationAsset?.chain_id
      );

      if (chain) {
        setFormValues((values) => ({
          ...values,
          destinationChain: chain,
        }));
      }
    }
  }, [chains, formValues.destinationAsset, formValues.destinationChain]);

  return {
    formValues,
    setFormValues,
  };
}
