import * as fs from "fs/promises";
import * as path from "path";

import { Variables } from "./_types";

interface Args {
  variables: Variables;
  destPath: string;
}

export async function writeEntrypoints({ variables: v, destPath }: Args) {
  await fs
    .mkdir(path.resolve(destPath), { recursive: true })
    .catch(() => void 0);

  const generatedTs = `/* eslint-disable */
// @ts-nocheck
import { Asset, AssetList, Chain } from "@graz-sh/types";

export const chainIds = ${JSON.stringify(v.chainIds)} as const;
export type ChainId = (typeof chainIds)[number] | (string & {});

export const chainNames = ${JSON.stringify(v.chainNames)} as const;
export type ChainName = (typeof chainNames)[number] | (string & {});

export type ChainIdOrName = ChainId | ChainName;
export const chainIdToName: Record<ChainIdOrName, ChainName> = ${JSON.stringify(
    v.chainIdToName,
  )};
export const chainNameToId: Record<ChainIdOrName, ChainId> = ${JSON.stringify(
    v.chainNameToId,
  )};

export const chainRecord: Record<ChainId, Chain> = ${JSON.stringify(
    v.chainRecord,
  )};

export const assetsRecord: Record<ChainId, Asset[]> = ${JSON.stringify(
    v.assetsRecord,
  )};
`;

  const generatedTarget = path.resolve(destPath, "generated.ts");
  await fs.writeFile(generatedTarget, generatedTs, "utf-8");
}
