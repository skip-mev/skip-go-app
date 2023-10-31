/* eslint-disable */
// @ts-nocheck
import { Asset, AssetList, Chain } from "@graz-sh/types";

import {
  assetsRecord,
  ChainIdOrName,
  chainIds,
  chainIdToName,
  chainNameToId,
  chainRecord,
} from "./generated";

function raise(message?: string, opts?: ErrorOptions): never {
  throw new Error(message, opts);
}

export function getChain(idOrName: ChainIdOrName): Chain {
  return (
    chainRecord[chainNameToId[idOrName]] ||
    raise(`chain '${idOrName}' does not exist in chainRecord`)
  );
}

export function getAssets(idOrName: ChainIdOrName): Asset[] {
  return (
    assetsRecord[chainNameToId[idOrName]] ||
    raise(`chain '${idOrName}' does not exist in assetsRecord`)
  );
}

export function getChains(): Chain[] {
  return Object.values(chainRecord);
}

export function getAssetLists(): AssetList[] {
  return chainIds.map((chainId) => ({
    chain_name: chainIdToName[chainId],
    assets: assetsRecord[chainId],
  }));
}

export * from "./generated";
