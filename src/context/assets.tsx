import { Asset } from "@skip-router/core";
import { createContext, FC, PropsWithChildren, useCallback, useContext, useEffect, useMemo } from "react";

import { useChains } from "@/hooks/useChains";

import { filterAssetsWithMetadata, useAssets as useSolveAssets } from "../solve";

export type AssetWithMetadata = Required<Asset>;

interface AssetsContext {
  assets: Record<string, AssetWithMetadata[]>;
  assetsByChainID: (chainID?: string) => AssetWithMetadata[];
  getAsset(denom: string, chainID: string): AssetWithMetadata | undefined;
  getFeeDenom(chainID: string): AssetWithMetadata | undefined;
  getNativeAssets(): AssetWithMetadata[];
  isReady: boolean;
}

export const AssetsContext = createContext<AssetsContext>({
  assets: {},
  assetsByChainID: () => [],
  getAsset: () => undefined,
  getFeeDenom: () => undefined,
  getNativeAssets: () => [],
  isReady: false,
});

export const AssetsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: chains } = useChains();
  const { data: solveAssets } = useSolveAssets();

  const assets = useMemo(() => {
    const data: Record<string, AssetWithMetadata[]> = {};

    if (!solveAssets || !chains) return data;

    for (const [chainID, assets] of Object.entries(solveAssets)) {
      data[chainID] = filterAssetsWithMetadata(assets);
    }

    return data;
  }, [chains, solveAssets]);

  const assetsByChainID: AssetsContext["assetsByChainID"] = useCallback(
    (chainID?: string) => {
      return chainID ? assets[chainID] || [] : [];
    },
    [assets],
  );

  const getAsset = useCallback(
    (denom: string, chainID: string) => {
      const asset = assets[chainID]?.find((asset) => asset.denom === denom);
      return asset;
    },
    [assets],
  );

  const getFeeDenom = useCallback(
    (chainID: string) => {
      const chain = (chains ?? []).find((chain) => chain.chainID === chainID);

      if (!chain || chain.feeAssets.length === 0) return undefined;

      // prioritize non-ibc assets
      const sortedFeeDenoms = [...chain.feeAssets].sort((a, b) => {
        if (a.denom.includes("ibc/")) return 1;
        if (b.denom.includes("ibc/")) return -1;
        return 0;
      });

      return getAsset(sortedFeeDenoms[0].denom, chainID);
    },
    [chains, getAsset],
  );

  const getNativeAssets = useCallback(() => {
    const nativeAssets: AssetWithMetadata[] = [];

    for (const chainAssetList of Object.values(assets)) {
      for (const asset of chainAssetList) {
        if (asset.chainID === asset.originChainID) {
          nativeAssets.push(asset);
        }
      }
    }

    return nativeAssets;
  }, [assets]);

  const isReady = useMemo(() => Object.keys(assets).length > 0, [assets]);

  useEffect(() => {
    if (!isReady || !chains || !assets) return;
    const load = (src: string) => {
      const img = new Image();
      img.src = src;
      img.onload = () => img.remove();
    };
    chains.forEach(({ chainID, logoURI }) => {
      logoURI && load(logoURI);
      (assets[chainID] || []).forEach(({ logoURI }) => {
        logoURI && load(logoURI);
      });
    });
  }, [assets, chains, isReady]);

  return (
    <AssetsContext.Provider
      value={{
        assets,
        assetsByChainID,
        getAsset,
        getFeeDenom,
        getNativeAssets,
        isReady,
      }}
    >
      {children}
    </AssetsContext.Provider>
  );
};

export function useAssets() {
  return useContext(AssetsContext);
}
