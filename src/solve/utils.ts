import { Asset } from "@skip-router/core";

export function isAssetWithMetadata(asset: Asset): asset is AssetWithMetadata {
  const { chainID, decimals, denom, name, recommendedSymbol, symbol } = asset;

  const identifier = recommendedSymbol || symbol || name || denom;

  if (!recommendedSymbol) {
    return console.warn(`asset error: ${identifier} on '${chainID}' is missing 'recommendedSymbol'`), false;
  }

  if (!name) {
    return console.warn(`asset error: ${identifier} on '${chainID}' is missing 'name'`), false;
  }

  if (!decimals) {
    return console.warn(`asset error: ${identifier} on '${chainID}' is missing 'decimals'`), false;
  }

  return true;
}

export type AssetWithMetadata = Asset & {
  recommendedSymbol: NonNullable<Asset["recommendedSymbol"]>;
  name: NonNullable<Asset["name"]>;
  decimals: NonNullable<Asset["decimals"]>;
};
