import { AssetWithMetadata } from "@/context/assets";

export function filterSifAssets(asset: AssetWithMetadata) {
  if (asset.originChainID === "sifchain-1" && asset.originDenom !== "rowan") {
    return false;
  }
  return true;
}
