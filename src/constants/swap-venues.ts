export interface SwapVenueConfig {
  name: string;
  imageURL: string;
}

export const SWAP_VENUES: Record<string, SwapVenueConfig> = {
  "neutron-astroport": {
    name: "Neutron Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "terra-astroport": {
    name: "Terra Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "injective-astroport": {
    name: "Injective Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "sei-astroport": {
    name: "Sei Astroport",
    imageURL: "https://avatars.githubusercontent.com/u/87135340",
  },
  "osmosis-poolmanager": {
    name: "Osmosis",
    imageURL: "https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/osmosis/dappImg/app.png",
  },
  "neutron-lido-satellite": {
    name: "Neutron Lido Satellite",
    imageURL: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/wsteth.svg",
  },
  "migaloo-white-whale": {
    name: "Migaloo White Whale",
    imageURL: "https://whitewhale.money/logo.svg",
  },
  "chihuahua-white-whale": {
    name: "Chihuahua White Whale",
    imageURL: "https://whitewhale.money/logo.svg",
  },
  "terra-white-whale": {
    name: "Terra White Whale",
    imageURL: "https://whitewhale.money/logo.svg",
  },
};
