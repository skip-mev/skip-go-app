import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useMemo,
} from "react";
import { useChains } from "./chains";
import {
  AssetWithMetadata,
  filterAssetsWithMetadata,
  useSkipClient,
  useAssets as useSolveAssets,
} from "../solve";

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

export const AssetsProvider: FC<PropsWithChildren> = ({ children }) => {
  const skipClient = useSkipClient();

  const { chains } = useChains();

  const { data: solveAssets } = useSolveAssets(skipClient);

  const assets = useMemo(() => {
    if (!solveAssets) {
      return {};
    }

    return Object.entries(solveAssets).reduce((acc, [chainID, assets]) => {
      return {
        ...acc,
        [chainID]: filterAssetsWithMetadata(assets),
      };
    }, {} as Record<string, AssetWithMetadata[]>);
  }, [solveAssets]);

  function assetsByChainID(chainID: string) {
    return assets[chainID] || [];
  }

  function getAsset(denom: string, chainID: string) {
    const asset = assets[chainID]?.find((asset) => asset.denom === denom);

    return asset;
  }

  function getFeeDenom(chainID: string) {
    const chain = chains.find((c) => c.chain_id === chainID);

    if (!chain || !chain.record?.chain.fees) {
      return undefined;
    }

    const feeDenom = chain.record.chain.fees.fee_tokens[0].denom;

    return getAsset(feeDenom, chainID);
  }

  function getNativeAssets() {
    const nativeAssets: AssetWithMetadata[] = [];

    for (const chainAssetList of Object.values(assets)) {
      for (const asset of chainAssetList) {
        if (asset.chain_id === asset.origin_chain_id) {
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
