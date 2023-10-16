/* eslint-disable @typescript-eslint/no-var-requires */

const { chains } = require("chain-registry");
const fs = require("fs/promises");

async function generate() {
  /** @type {string[]} */
  const chainIds = [];

  /** @type {Record<string, any>} */
  const chainRecord = {};

  for (const chain of chains) {
    if (!chain.chain_id) continue;
    chainIds.push(chain.chain_id);
    chainRecord[chain.chain_id] = chain;
  }

  await fs.mkdir("src/chains/", { recursive: true }).catch(() => {});

  await fs.writeFile(
    "src/chains/chainIds.js",
    "module.exports=" + JSON.stringify(chainIds),
    "utf-8",
  );

  const chainIdLiteralType = chainIds
    .map((id) => `"${id}"`)
    .concat("(string & {})")
    .join("|");

  const chainIdsDts = `/* eslint-disable */
export type ChainId = ${chainIdLiteralType};
declare const chainIds: ChainId[];
export default chainIds;
`;
  await fs.writeFile("src/chains/chainIds.d.ts", chainIdsDts, "utf-8");

  await fs.writeFile(
    "src/chains/chainRecord.js",
    "module.exports=" + JSON.stringify(chainRecord),
    "utf-8",
  );

  const chainRecordDts = `/* eslint-disable */
import { Chain } from "@chain-registry/types";
import { ChainId } from "./chainIds";
declare const chainRecord: Record<ChainId, Chain>;
export default chainRecord;
`;
  await fs.writeFile("src/chains/chainRecord.d.ts", chainRecordDts, "utf-8");
}

void generate();
