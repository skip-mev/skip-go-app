import { Asset } from "@skip-router/core";

import { AssetWithMetadata } from "@/context/assets";

export function assetHasMetadata(asset: Asset) {
  if (!asset.decimals) {
    return false;
  }

  if (!asset.symbol) {
    return false;
  }

  if (!asset.name) {
    return false;
  }

  if (!asset.logoURI) {
    return false;
  }

  return true;
}

export function isAssetWithMetadata(asset: Asset): asset is AssetWithMetadata {
  return assetHasMetadata(asset);
}

export function filterAssetsWithMetadata(assets: Asset[]) {
  return assets.filter(isAssetWithMetadata);
}
