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

function getAssetSymbolSuffix(originDenom: string, originChainName: string) {
  switch (originChainName) {
    case "Axelar":
      if (originDenom.includes("polygon-")) {
        return ".axl (Polygon)";
      }

      if (originDenom.includes("avalanche-")) {
        return ".axl (Avalanche)";
      }

      return ".axl";
    case "Sifchain":
      return ".sif";
    case "Gravity Bridge":
      return ".grv";
    case "Noble":
      return "";
    default:
      return ` ${originChainName}`;
  }
}

function getAssetSymbol(
  asset: AssetWithMetadata,
  assets: Asset[],
  chains: Chain[],
) {
  if (asset.originChainID === "axelar-dojo-1") {
    if (asset.originDenom === "uaxl") {
      return asset.symbol;
    }

    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    return `${asset.symbol?.replace("axl", "")}${getAssetSymbolSuffix(
      asset.originDenom,
      originChainName,
    )}`;
  }

  if (asset.originChainID === "gravity-bridge-3") {
    if (asset.originDenom === "ugraviton") {
      return asset.symbol;
    }

    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    return `${asset.symbol}${getAssetSymbolSuffix(
      asset.originDenom,
      originChainName,
    )}`;
  }

  if (asset.originChainID === "sifchain-1") {
    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    if (asset.originDenom === "rowan") {
      return asset.symbol;
    }

    return `${asset.symbol}${getAssetSymbolSuffix(
      asset.originDenom,
      originChainName,
    )}`;
  }

  // this just handles a weird EVM token edge case
  if (asset.symbol?.startsWith("axl")) {
    return `${asset.symbol.replace("axl", "")}.axl`;
  }

  const hasDuplicates =
    (assets?.filter((a) => a.symbol === asset.symbol).length ?? 0) > 1;

  if (hasDuplicates) {
    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    return `${asset.symbol}${getAssetSymbolSuffix(
      asset.originDenom,
      originChainName,
    )}`;
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

    if (!chain || chain.feeAssets.length === 0) {
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

  const isReady = useMemo(() => Object.keys(assets).length > 0, [assets]);

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
