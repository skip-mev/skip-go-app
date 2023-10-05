import { Asset } from "@skip-router/core";
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useMemo,
} from "react";

import { Chain, useChains } from "@/api/queries";

import {
  filterAssetsWithMetadata,
  useAssets as useSolveAssets,
} from "../solve";

export type AssetWithMetadata = Required<Asset>;

interface AssetsContext {
  assets: Record<string, AssetWithMetadata[]>;
  assetsByChainID: (chainID: string) => AssetWithMetadata[];
  getAsset(denom: string, chainID: string): AssetWithMetadata | undefined;
  getFeeDenom(chainID: string): AssetWithMetadata | undefined;
  getNativeAssets(): AssetWithMetadata[];
}

export const AssetsContext = createContext<AssetsContext>({
  assets: {},
  assetsByChainID: () => [],
  getAsset: () => undefined,
  getFeeDenom: () => undefined,
  getNativeAssets: () => [],
});

function getAssetSymbol(
  asset: AssetWithMetadata,
  assets: Asset[],
  chains: Chain[],
) {
  const hasDuplicates =
    (assets?.filter((a) => a.symbol === asset.symbol).length ?? 0) > 1;

  if (hasDuplicates) {
    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    return `${originChainName} ${asset.symbol}`;
  }

  return asset.symbol;
}

export const AssetsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { chains } = useChains();

  const { data: solveAssets } = useSolveAssets();

  const assets = useMemo(() => {
    if (!solveAssets || !chains) {
      return {};
    }

    return Object.entries(solveAssets).reduce(
      (acc, [chainID, assets]) => {
        return {
          ...acc,
          [chainID]: filterAssetsWithMetadata(assets).map((asset) => ({
            ...asset,
            symbol: getAssetSymbol(asset, assets, chains),
          })),
        };
      },
      {} as Record<string, AssetWithMetadata[]>,
    );
  }, [chains, solveAssets]);

  function assetsByChainID(chainID: string) {
    return assets[chainID] || [];
  }

  function getAsset(denom: string, chainID: string) {
    const asset = assets[chainID]?.find((asset) => asset.denom === denom);

    return asset;
  }

  function getFeeDenom(chainID: string) {
    const chain = (chains ?? []).find((c) => c.chainID === chainID);

    if (!chain || !chain.feeAssets) {
      return undefined;
    }

    return getAsset(chain.feeAssets[0].denom, chainID);
  }

  function getNativeAssets() {
    const nativeAssets: AssetWithMetadata[] = [];

    for (const chainAssetList of Object.values(assets)) {
      for (const asset of chainAssetList) {
        if (asset.chainID === asset.originChainID) {
          nativeAssets.push(asset);
        }
      }
    }

    return nativeAssets;
  }

  return (
    <AssetsContext.Provider
      value={{
        assets,
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
