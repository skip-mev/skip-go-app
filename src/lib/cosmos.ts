import { Chain } from "@/hooks/useChains";

// chains whose logo provided by the Skip API is not suitable for our UI.
const chainsToUseChainListLogo = [
  "mars-1",
  "neutron-1",
  "pion-1",
  "noble-1",
  "osmosis-1",
  "osmo-test-5",
  "stride-1",
];

export function getChainLogo(chain: Chain) {
  if (chain.chainID === "dydx-mainnet-1") {
    return "https://raw.githubusercontent.com/cosmos/chain-registry/master/dydx/images/dydx.png";
  }

  if (chain.chainID === "celestia") {
    return "https://raw.githubusercontent.com/cosmos/chain-registry/f1d526b2ec1e03f5555b0484ac5942aa12d884ef/celestia/images/celestia.svg";
  }

  if (chainsToUseChainListLogo.includes(chain.chainID)) {
    return `${chainNameToChainlistURL(chain.chainName)}/chainImg/_chainImg.svg`;
  }

  if (chain.chainID === "migaloo-1") {
    return chain.logoURI!.replace("-light", "-dark");
  }

  return (
    chain.logoURI ||
    `${chainNameToChainlistURL(chain.chainName)}/chainImg/_chainImg.svg`
  );
}

export function chainNameToChainlistURL(chainName: string) {
  const idToNameMap: Record<string, string> = {
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
