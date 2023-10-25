/* eslint-disable */
// @ts-nocheck
import type { Asset, Chain } from "@chain-registry/types";

import { raise } from "@/utils/assert";

import type { ChainIdOrName } from "./generated";
import { assetsRecord, chainNameToId, chainRecord } from "./generated";

export const getChain = (idOrName: ChainIdOrName): Chain => {
  return (
    chainRecord[chainNameToId[idOrName]] ||
    raise(`chain '${idOrName}' does not exist in chainRecord`)
  );
};

export const getAssets = (idOrName: ChainIdOrName): Asset[] => {
  return (
    assetsRecord[chainNameToId[idOrName]] ||
    raise(`chain '${idOrName}' does not exist in assetsRecord`)
  );
};

export * from "./generated";
