import { toBech32 } from "@cosmjs/encoding";
import { getChainByID } from "@/utils/utils";
import { MsgsRequest, RouteResponse, SkipClient } from "./client";
import { Asset, AssetWithMetadata } from "./types";

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

  if (!asset.logo_uri) {
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

export async function getNumberOfTransactionsFromRoute(route: RouteResponse) {
  const userAddresses: Record<string, string> = {};
  for (const chainID of route.chain_ids) {
    const chain = getChainByID(chainID);

    // fake address
    userAddresses[chainID] = toBech32(
      chain.bech32_prefix,
      Uint8Array.from(Array.from({ length: 20 }))
    );
  }

  const msgRequest: MsgsRequest = {
    source_asset_denom: route.source_asset_denom,
    source_asset_chain_id: route.source_asset_chain_id,
    dest_asset_denom: route.dest_asset_denom,
    dest_asset_chain_id: route.dest_asset_chain_id,
    amount_in: route.amount_in,
    operations: route.operations,

    estimated_amount_out: route.estimated_amount_out,
    chain_ids_to_addresses: userAddresses,
    slippage_tolerance_percent: "0.05",
  };

  const skipClient = new SkipClient();

  const msgsResponse = await skipClient.fungible.getMessages(msgRequest);

  return msgsResponse.msgs.length;
}
