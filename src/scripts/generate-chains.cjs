/* eslint-disable */

const fs = require("fs/promises");
const path = require("path");
const outPath = path.resolve(__dirname, "../chains");

const registries = [
  {
    packageName: "chain-registry",
    registryPath: path.resolve(__dirname, "../../node_modules/chain-registry"),
    isCamelCase: true,
  },
  {
    packageName: "initia-registry",
    registryPath: path.resolve(__dirname, "../../node_modules/@initia/initia-registry/main"),
    isCamelCase: false,
  },
];

async function collectMainnetChains({ registryPath, packageName, isCamelCase }) {
  const mainnetDir = path.join(registryPath, "mainnet");
  const mainnetRpc = await collectChainData(mainnetDir, packageName, "mainnet", "rpc", isCamelCase);
  const mainnetRest = await collectChainData(mainnetDir, packageName, "mainnet", "rest", isCamelCase);
  return { rpc: mainnetRpc, rest: mainnetRest };
}

async function collectTestnetChains({ registryPath, packageName, isCamelCase }) {
  const testnetDir = path.join(registryPath, "testnet");
  const testnetRpc = await collectChainData(testnetDir, packageName, "testnet", "rpc", isCamelCase);
  const testnetRest = await collectChainData(testnetDir, packageName, "testnet", "rest", isCamelCase);
  return { rpc: testnetRpc, rest: testnetRest };
}

async function collectChainData(directory, packageName, networkType, apiType, isCamelCase) {
  const chains = [];
  try {
    const dirEntries = await fs.readdir(directory, { withFileTypes: true });

    for (const dirent of dirEntries) {
      if (dirent.isDirectory()) {
        const chainName = dirent.name;
        try {
          const chainJsPath = path.join(directory, chainName, "chain.js");
          const chainModule = require(chainJsPath);
          const chainData = chainModule.default || chainModule;
          const chainArray = Array.isArray(chainData) ? chainData : [chainData];
          const chain = chainArray[0];
          if (isCamelCase) {
            const extractedData = apiType === "rpc" ? extractCamelCaseRpc(chain) : extractCamelCaseRest(chain);
            chains.push(extractedData);
          } else {
            const extractedData = apiType === "rpc" ? extractRpc(chain) : extractRest(chain);
            chains.push(extractedData);
          }

        } catch (error) {
          console.warn(`Error generating chain info for ${chainName} in ${packageName}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error(`Error processing ${networkType} ${packageName} directory ${directory}:`, error.message);
  }

  return chains;
}

function extractRpc(chain) {
  const chainInfo = {
    chainId: chain.chain_id,
    rpc: chain.apis.rpc.map((rpc) => rpc.address),
    chainName: chain.chain_name,
  };

  return chainInfo;
}

function extractRest(chain) {
  const chainInfo = {
    chainId: chain.chain_id,
    rest: chain.apis.rest.map((rest) => rest.address),
    chainName: chain.chain_name,
  };

  return chainInfo;
}

function extractCamelCaseRpc(chain) {
  const chainInfo = {
    chainId: chain.chainId,
    rpc: chain.apis.rpc.map((rpc) => rpc.address),
    chainName: chain.chainName,
  };

  return chainInfo;
}

function extractCamelCaseRest(chain) {
  const chainInfo = {
    chainId: chain.chainId,
    rest: chain.apis.rest.map((rest) => rest.address),
    chainName: chain.chainName,
  };

  return chainInfo;
}

async function codegen() {
  console.log("Getting mainnet rpc files...");
  let mainnetRpc = [];
  let mainnetRest = [];
  for (const registry of registries) {
    const { rpc, rest } = await collectMainnetChains(registry);
    mainnetRpc = mergeArrays(mainnetRpc, rpc);
    mainnetRest = mergeArrays(mainnetRest, rest);
  }

  console.log("Getting testnet rest files...");
  let testnetRpc = [];
  let testnetRest = [];
  for (const registry of registries) {
    const { rpc, rest } = await collectTestnetChains(registry);
    testnetRpc = mergeArrays(testnetRpc, rpc);
    testnetRest = mergeArrays(testnetRest, rest);
  }

  const rest = mergeArrays(mainnetRest, testnetRest);
  const restOutputFilePath = path.resolve(outPath, "rest.json");
  await fs.writeFile(restOutputFilePath, JSON.stringify(rest), "utf-8");
  console.log(`Generated rest file at ${restOutputFilePath}`);

  const rpc = mergeArrays(mainnetRpc, testnetRpc);
  const rpcOutputFilePath = path.resolve(outPath, "rpc.json");
  await fs.writeFile(rpcOutputFilePath, JSON.stringify(rpc), "utf-8");
  console.log(`Generated rpc file at ${rpcOutputFilePath}`);

  console.log(`Generated all chains file at ${outPath}`);
}

const mergeArrays = (arr1, arr2) => {
  const merged = [...arr1, ...arr2];
  const map = new Map();

  merged.forEach((item) => {
    map.set(item.chainId, item); // second occurrence overwrites first
  });

  return Array.from(map.values());
};

void codegen();
