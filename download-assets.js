const axios = require("axios");
const fs = require("fs");

function chainNameToChainlistURL(chainName) {
  const idToNameMap = {
    kichain: "ki-chain",
    fetchhub: "fetchai",
    mars: "mars-protocol",
    assetmantle: "asset-mantle",
    omniflixhub: "omniflix",
    gravitybridge: "gravity-bridge",
    terra2: "terra",
    cosmoshub: "cosmos",
    cryptoorgchain: "crypto-org",
  };

  const name = idToNameMap[chainName] || chainName;

  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${name}`;
}

const SKIP = ["gitopia", "loyal", "agoric", "planq", "jackal"];

async function main() {
  const response = await axios.get("https://api.skip.money/v1/ibc/chains");

  const chains = response.data.chains;

  const assets = {};

  for (const chain of chains) {
    if (SKIP.includes(chain.chainName)) {
      continue;
    }

    const url = `${chainNameToChainlistURL(chain.chainName)}/assets.json`;

    try {
      const { data } = await axios.get(url);
      console.log(`${chain.chainName} has ${data.length} assets`);
      assets[chain.chainId] = data.map((asset) => ({
        denom: asset.denom,
        type: asset.type,
        origin_chain: asset.origin_chain,
        origin_denom: asset.origin_denom,
        origin_type: asset.origin_type,
        symbol: asset.symbol,
        decimals: asset.decimals,
        description: asset.description,
        coinGeckoId: asset.coinGeckoId,
        image: `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${asset.image}`,
      }));
    } catch (error) {
      throw new Error(`${chain.chainName} ERROR`);
    }
  }

  fs.writeFileSync("assets.json", JSON.stringify(assets, null, 2));
}

main();
