/* eslint-disable */

const fs = require("fs/promises");
const path = require("path");
const outPath = path.resolve(__dirname, "../chains");

const registries = [
  {
    packageName: "chain-registry",
    registryPath: path.resolve(__dirname, "../../node_modules/chain-registry"),
  },
  {
    packageName: "initia-registry",
    registryPath: path.resolve(__dirname, "../../node_modules/@initia/initia-registry/main"),
  },
];

async function collectMainnetChains({ registryPath, packageName }) {
  const mainnetDir = path.join(registryPath, "mainnet");
  const mainnetRpc = await collectChainData(mainnetDir, packageName, "mainnet", "rpc");
  const mainnetRest = await collectChainData(mainnetDir, packageName, "mainnet", "rest");
  return { rpc: mainnetRpc, rest: mainnetRest };
}

async function collectTestnetChains({ registryPath, packageName }) {
  const testnetDir = path.join(registryPath, "testnet");
  const testnetRpc = await collectChainData(testnetDir, packageName, "testnet", "rpc");
  const testnetRest = await collectChainData(testnetDir, packageName, "testnet", "rest");
  return { rpc: testnetRpc, rest: testnetRest };
}

async function collectChainData(directory, packageName, networkType, apiType) {
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
          const extractedData = apiType === "rpc" ? extractRpc(chain) : extractRest(chain);
          chains.push(extractedData);
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

async function codegen() {
  console.log("Getting mainnet rpc files...");
  let mainnetRpc = [];
  let mainnetRest = [];
  for (const registry of registries) {
    const { rpc, rest } = await collectMainnetChains(registry);
    mainnetRpc = mainnetRpc.concat(rpc);
    mainnetRest = mainnetRest.concat(rest);
  }

  console.log("Getting testnet rest files...");
  let testnetRpc = [];
  let testnetRest = [];
  for (const registry of registries) {
    const { rpc, rest } = await collectTestnetChains(registry);
    testnetRpc = testnetRpc.concat(rpc);
    testnetRest = testnetRest.concat(rest);
  }

  const rest = mainnetRest.concat(testnetRest);
  const restOutputFilePath = path.resolve(outPath, "rest.json");
  await fs.writeFile(restOutputFilePath, JSON.stringify(rest), "utf-8");
  console.log(`Generated rest file at ${restOutputFilePath}`);

  const rpc = mainnetRpc.concat(testnetRpc);
  const rpcOutputFilePath = path.resolve(outPath, "rpc.json");
  await fs.writeFile(rpcOutputFilePath, JSON.stringify(rpc), "utf-8");
  console.log(`Generated rpc file at ${rpcOutputFilePath}`);

  console.log(`Generated all chains file at ${outPath}`);
}

void codegen();
