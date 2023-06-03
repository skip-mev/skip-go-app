export interface ChainConfig {
  id: string;
  name: string;
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: "osmosis-1",
    name: "Osmosis",
  },
  {
    id: "cosmoshub-4",
    name: "Cosmos Hub",
  },
  {
    id: "juno-1",
    name: "Juno",
  },
  {
    id: "neutron-1",
    name: "Neutron",
  },
  {
    id: "axelar-dojo-1",
    name: "Axelar",
  },
  {
    id: "evmos_9001-2",
    name: "Evmos",
  },
  {
    id: "stride-1",
    name: "Stride",
  },
  {
    id: "gravity-bridge-3",
    name: "Gravity Bridge",
  },
];

export function chainIDToChainlistURL(chainID: string) {
  const idToNameMap: Record<string, string> = {
    "osmosis-1": "osmosis",
    "cosmoshub-4": "cosmos",
    "juno-1": "juno",
    "neutron-1": "neutron",
    "axelar-dojo-1": "axelar",
    "evmos_9001-2": "evmos",
    "stride-1": "stride",
    "gravity-bridge-3": "gravity-bridge",
  };

  const name = idToNameMap[chainID] || chainID;

  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${name}`;
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
