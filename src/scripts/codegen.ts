import * as path from "path";

import { getChainsPaths } from "@/ast/get-chains-paths";
import { parseChainPaths } from "@/ast/parse-chain-paths";
import { validateChainsPaths } from "@/ast/validate-chains-paths";
import { writeEntrypoints } from "@/ast/write-entrypoints";

async function codegen() {
  const registryPath = path.resolve("chain-registry");

  const chainPaths = await getChainsPaths({
    registryPath,
  });

  const validChainPaths = await validateChainsPaths({
    registryPath,
    chainPaths,
  });

  const variables = await parseChainPaths({
    registryPath,
    chainPaths: validChainPaths,
  });

  await writeEntrypoints({
    variables,
    destPath: "src/chains/",
  });
}

void codegen();
