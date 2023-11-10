import { globby } from "globby";

interface Args {
  registryPath: string;
}

export async function getChainsPaths({ registryPath }: Args) {
  const mainnetGlobs = ["*", "!_*", "!testnets"];
  const testnetGlobs = ["testnets/*", "!testnets/_*"];

  const paths = await globby([...mainnetGlobs, ...testnetGlobs], {
    cwd: registryPath,
    onlyDirectories: true,
  });

  return paths;
}
