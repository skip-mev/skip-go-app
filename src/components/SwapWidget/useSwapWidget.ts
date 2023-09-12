import { AssetWithMetadata, useAssets } from "@/context/assets";
import { Chain, useChains } from "@/context/chains";
import { useBalancesByChain } from "@/cosmos";
import { useRoute } from "@/solve";
import { isEVMChain } from "@/utils/utils";
import { useChain } from "@cosmos-kit/react";
import { ethers } from "ethers";
import { useEffect, useMemo, useState } from "react";

export const LAST_SOURCE_CHAIN_KEY = "IBC_DOT_FUN_LAST_SOURCE_CHAIN";

export function useSwapWidget() {
  const {
    formValues,
    setFormValues,
    onSourceChainChange,
    onSourceAssetChange,
    onDestinationChainChange,
    onDestinationAssetChange,
  } = useFormValues();

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
    amountInWei,
    formValues.sourceAsset?.denom,
    formValues.sourceAsset?.chainID,
    formValues.destinationAsset?.denom,
    formValues.destinationAsset?.chainID,
    true
  );

  const numberOfTransactions = useMemo(() => {
    if (!routeResponse) {
      return 0;
    }

    return routeResponse.txsRequired;
  }, [routeResponse]);

  const routeLoading = useMemo(() => {
    return routeFetchStatus === "fetching";
  }, [routeFetchStatus]);

  const amountOut = useMemo(() => {
    if (!routeResponse) {
      return "0.0";
    }

    if (routeResponse.doesSwap && routeResponse.estimatedAmountOut) {
      return ethers.formatUnits(
        routeResponse.estimatedAmountOut,
        formValues.destinationAsset?.decimals ?? 6
      );
    }

    return formValues.amountIn;
  }, [
    formValues.amountIn,
    formValues.destinationAsset?.decimals,
    routeResponse,
  ]);

  let sourceChainName = "cosmoshub";
  if (formValues.sourceChain && !isEVMChain(formValues.sourceChain.chainID)) {
    sourceChainName = formValues.sourceChain.chainName;
  }

  const { address } = useChain(sourceChainName);

  const { data: balances } = useBalancesByChain(
    address,
    formValues.sourceChain
  );

  const insufficientBalance = useMemo(() => {
    if (!formValues.sourceAsset || !balances) {
      return false;
    }

    const amountIn = parseFloat(formValues.amountIn);

    if (isNaN(amountIn)) {
      return false;
    }

    const balanceStr = balances[formValues.sourceAsset.denom] ?? "0";

    const balance = parseFloat(
      ethers.formatUnits(balanceStr, formValues.sourceAsset.decimals)
    );

    return amountIn > balance;
  }, [balances, formValues.amountIn, formValues.sourceAsset]);

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
    insufficientBalance,
    onSourceChainChange,
    onSourceAssetChange,
    onDestinationChainChange,
    onDestinationAssetChange,
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

  const [userSelectedDestinationAsset, setUserSelectedDestinationAsset] =
    useState(false);

  const [formValues, setFormValues] = useState<FormValues>({
    amountIn: "",
  });

  // Select initial source chain.
  // - If chainID exists in local storage, use that.
  // - Otherwise, default to cosmoshub-4.
  useEffect(() => {
    if (!formValues.sourceChain && chains.length > 0) {
      const chainID =
        localStorage.getItem(LAST_SOURCE_CHAIN_KEY) ?? "cosmoshub-4";
      setFormValues((values) => ({
        ...values,
        sourceChain: chains.find((chain) => chain.chainID === chainID),
      }));
    }
  }, [chains, formValues.sourceChain]);

  // When source chain changes, save to local storage.
  useEffect(() => {
    if (formValues.sourceChain) {
      localStorage.setItem(
        LAST_SOURCE_CHAIN_KEY,
        formValues.sourceChain.chainID
      );
    }
  }, [formValues.sourceChain]);

  // Select initial source asset.
  // - If fee denom exists for source chain, use that.
  // - Otherwise, default to first asset in list.
  useEffect(() => {
    if (formValues.sourceChain && !formValues.sourceAsset) {
      const feeAsset = getFeeDenom(formValues.sourceChain.chainID);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          sourceAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.sourceChain.chainID);
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

  const onSourceChainChange = (chain: Chain) => {
    setFormValues({
      ...formValues,
      sourceChain: chain,
      sourceAsset: undefined,
      amountIn: "",
    });
  };

  const onSourceAssetChange = (asset: AssetWithMetadata) => {
    setFormValues({
      ...formValues,
      sourceAsset: asset,
    });
  };

  // When a new destination chain is selected, select a new destination asset:
  // - If there is a destination asset already selected, try to find the equivalent asset on the new chain.
  // - Otherwise, if fee denom exists for destination chain, use that.
  // - Otherwise, default to first asset in list.
  const onDestinationChainChange = (chain: Chain) => {
    const assets = assetsByChainID(chain.chainID);

    let destinationAsset = getFeeDenom(chain.chainID) ?? assets[0];
    if (formValues.destinationAsset && userSelectedDestinationAsset) {
      const equivalentAsset = findEquivalentAsset(
        formValues.destinationAsset,
        assets
      );

      if (equivalentAsset) {
        destinationAsset = equivalentAsset;
      }
    }

    setFormValues((values) => ({
      ...values,
      destinationChain: chain,
      destinationAsset,
    }));
  };

  const onDestinationAssetChange = (asset: AssetWithMetadata) => {
    // If destination asset is defined, but no destination chain, select chain based off asset.
    let destinationChain = formValues.destinationChain;
    if (!destinationChain) {
      destinationChain = chains.find((c) => c.chainID === asset.chainID);
    }

    // If destination asset is user selected, set flag to true.
    setUserSelectedDestinationAsset(true);

    setFormValues({
      ...formValues,
      destinationAsset: asset,
      destinationChain,
    });
  };

  return {
    formValues,
    setFormValues,
    onSourceAssetChange,
    onSourceChainChange,
    onDestinationChainChange,
    onDestinationAssetChange,
  };
}

function findEquivalentAsset(
  asset: AssetWithMetadata,
  assets: AssetWithMetadata[]
) {
  return assets.find((a) => {
    const isSameOriginChain = a.originChainID === asset.originChainID;
    const isSameOriginDenom = a.originDenom === asset.originDenom;

    return isSameOriginChain && isSameOriginDenom;
  });
}
