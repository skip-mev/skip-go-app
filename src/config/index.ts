export const IGNORE_CHAINS = ["agoric", "8ball", "akashnet-2"];

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

export interface SwapVenueConfig {
  name: string;
  imageURL: string;
}

export const SWAP_VENUES: Record<string, SwapVenueConfig> = {
  "neutron-astroport": {
    name: "Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "osmosis-poolmanager": {
    name: "Osmosis",
    imageURL:
      "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/dappImg/app.png",
  },
};
