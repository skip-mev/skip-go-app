import { AssetList } from "@graz-sh/types";
import { assetListSchema } from "@graz-sh/types/zod";
import * as fs from "fs/promises";
import * as path from "path";

interface Args {
  registryPath: string;
  chainPath: string;
}

export async function parseAssetListJson({ registryPath, chainPath }: Args) {
  const jsonPath = path.resolve(registryPath, chainPath, "assetlist.json");

  // TODO: Revisit initia assetlist config parsing - improve validation and error handling
  // for initia-specific asset structures and ensure all asset types (CW20, ERC20) are properly included
  
  let data: AssetList;
  try {
    const content = await fs.readFile(jsonPath, "utf-8");
    data = await assetListSchema.parseAsync(JSON.parse(content));
  } catch (error) {
    console.warn(`Skipping asset list for ${chainPath}:`, error instanceof Error ? error.message : error);
    data = {
      chain_name: chainPath,
      assets: [],
    };
  }

  return data;
}
