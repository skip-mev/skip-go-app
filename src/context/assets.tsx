import { FC, PropsWithChildren, createContext, useContext } from "react";
import { Asset } from "@/cosmos";
import { ASSET_LIST } from "../config/assets";
import { useChains } from "./chains";

interface AssetsContext {
  assets: Record<string, Asset[]>;
  assetsByChainID: (chainID: string) => Asset[];
  getAsset(denom: string, chainID: string): Asset | undefined;
  getFeeDenom(chainID: string): Asset | undefined;
  getNativeAssets(): Asset[];
}

export const AssetsContext = createContext<AssetsContext>({
  assets: {},
  assetsByChainID: () => [],
  getAsset: () => undefined,
  getFeeDenom: () => undefined,
  getNativeAssets: () => [],
});

export const AssetsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chains } = useChains();

  function assetsByChainID(chainID: string) {
    return ASSET_LIST[chainID] || [];
  }

  function getAsset(denom: string, chainID: string) {
    return ASSET_LIST[chainID]?.find((asset) => asset.denom === denom);
  }

  function getFeeDenom(chainID: string) {
    const chain = chains.find((c) => c.chainId === chainID);

    if (!chain || !chain.record?.chain.fees) {
      return undefined;
    }

    const feeDenom = chain.record.chain.fees.fee_tokens[0].denom;

    return getAsset(feeDenom, chainID);
  }

  function getNativeAssets() {
    const nativeAssets: Asset[] = [];

    for (const chainAssetList of Object.values(ASSET_LIST)) {
      for (const asset of chainAssetList) {
        if (asset.type === "native" || asset.type === "staking") {
          nativeAssets.push(asset);
        }
      }
    }

    return nativeAssets;
  }

  return (
    <AssetsContext.Provider
      value={{
        assets: ASSET_LIST,
        assetsByChainID,
        getAsset,
        getFeeDenom,
        getNativeAssets,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
};

export function useAssets() {
  return useContext(AssetsContext);
}
