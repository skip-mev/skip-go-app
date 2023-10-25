/* eslint-disable @typescript-eslint/no-var-requires */

var { chains, assets } = require("chain-registry");
var fs = require("fs/promises");

/** @type {string[]} */ var chainIds = [];
/** @type {string[]} */ var chainNames = [];

/** @type {Record<string, any>} */ var chainIdToName = {};
/** @type {Record<string, any>} */ var chainNameToId = {};
/** @type {Record<string, any>} */ var chainRecord = {};
/** @type {Record<string, any>} */ var assetsRecord = {};

async function generate() {
  for (var chain of chains) {
    delete chain.$schema;

    if (!chain.chain_id) continue;
    if (!chain.chain_name) continue;

    chainIds.push(chain.chain_id);
    chainNames.push(chain.chain_name);

    chainIdToName[chain.chain_id] = chain.chain_name;
    chainIdToName[chain.chain_name] = chain.chain_name;

    chainNameToId[chain.chain_id] = chain.chain_id;
    chainNameToId[chain.chain_name] = chain.chain_id;

    chainRecord[chain.chain_id] = chain;
  }

  for (var asset of assets) {
    if (!asset.chain_name) continue;
    delete asset.$schema;
    assetsRecord[chainNameToId[asset.chain_name]] = asset.assets;
  }

  await fs.mkdir("src/chains/", { recursive: true }).catch(() => {});

  var generatedTs = `/* eslint-disable */
// @ts-nocheck
import { Asset, Chain } from "@chain-registry/types";

export const chainIds = ${JSON.stringify(chainIds)} as const;
export type ChainId = (typeof chainIds)[number] | (string & {});

export const chainNames = ${JSON.stringify(chainNames)} as const;
export type ChainName = (typeof chainNames)[number] | (string & {});

export type ChainIdOrName = ChainId | ChainName;
export const chainIdToName: Record<ChainIdOrName, ChainName> = ${JSON.stringify(
    chainIdToName,
  )};
export const chainNameToId: Record<ChainIdOrName, ChainId> = ${JSON.stringify(
    chainNameToId,
  )};

export const chainRecord: Record<ChainId, Chain> = ${JSON.stringify(
    chainRecord,
  )};

export const assetsRecord: Record<ChainId, Asset[]> = ${JSON.stringify(
    assetsRecord,
  )};
`;

  await fs.writeFile("src/chains/generated.ts", generatedTs, {
    encoding: "utf-8",
  });
}

void generate();
