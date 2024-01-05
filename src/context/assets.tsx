import { Asset } from "@skip-router/core";
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
} from "react";

import { Chain, useChains } from "@/hooks/useChains";

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
    case "Neutron":
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
      return asset.symbol ?? asset.denom;
    }

    const originChain = chains.find((c) => c.chainID === asset.originChainID);
    const originChainName = originChain?.prettyName ?? asset.originChainID;

    return `${asset.symbol?.replace("axl", "")}${getAssetSymbolSuffix(
      asset.originDenom,
      originChainName,
    )}`.replace("..", ".");
  }

  if (asset.originChainID === "gravity-bridge-3") {
    if (asset.chainID === "core-1") {
      return asset.symbol ?? asset.denom;
    }
    if (asset.originDenom === "ugraviton") {
      return asset.symbol ?? asset.denom;
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
      return asset.symbol ?? asset.denom;
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

  return asset.symbol ?? asset.denom;
}

export const AssetsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { data: chains } = useChains();
  const { data: solveAssets } = useSolveAssets();

  const assets = useMemo(() => {
    const data: Record<string, AssetWithMetadata[]> = {};

    if (!solveAssets || !chains) return data;

    for (const [chainID, assets] of Object.entries(solveAssets)) {
      data[chainID] = filterAssetsWithMetadata(assets).map((asset) => {
        const logoURI =
          asset.originDenom === "utia"
            ? "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/celestia/asset/tia.png"
            : asset.logoURI;
        return {
          ...asset,
          symbol: getAssetSymbol(asset, assets, chains),
          logoURI,
        };
      });
    }

    return data;
  }, [chains, solveAssets]);

  const assetsByChainID = useCallback(
    (chainID: string) => {
      return assets[chainID] || [];
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
