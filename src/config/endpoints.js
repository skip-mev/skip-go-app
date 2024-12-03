// @ts-check

/**
 * @typedef {{ endpoint: string | undefined; isPrivate: boolean; isApiKey?: boolean } | undefined} EndpointConfig
 */

/**
 * @typedef {(chainID: string) => MaybePromise<EndpointConfig>} FallbackEndpointFn
 */

/**
 * @param {string} chainID
 * @param {"api" | "rpc"} type
 * @returns {EndpointConfig}
 */
exports.getWhitelabelEndpoint = (chainID, type) => {
  /** @type {string | undefined} */
  let endpoint;

  if (chainID === "solana-devnet") {
    return {
      endpoint: "https://devnet.helius-rpc.com",
      isPrivate: false,
      isApiKey: true,
    };
  }
  if (chainID === "solana") {
    return {
      endpoint: "https://mainnet.helius-rpc.com",
      isPrivate: false,
      isApiKey: true,
    };
  }

  if (type === "api") {
    endpoint = exports.CUSTOM_API_CHAIN_IDS[chainID];
  } else {
    endpoint = exports.CUSTOM_RPC_CHAIN_IDS[chainID];
  }

  if (endpoint) {
    return {
      endpoint,
      isPrivate: false,
    };
  }

  /** @type {true | number | undefined} */
  const config = exports.WHITELABEL_CHAIN_IDS[chainID];

  if (!config) {
    return undefined;
  }

  const nodeID = exports.WHITELABEL_CUSTOM_NODE_IDS[chainID] || chainID;

  const parts = [nodeID, "skip", type]; // e.g. 'cosmoshub-4-skip-rpc'
  if (typeof config === "number") {
    parts.push(config.toString()); // e.g. 'osmosis-1-skip-rpc-1'
  }

  return {
    endpoint: `https://${parts.join("-")}.polkachu.com`,
    isPrivate: true,
  };
};

/**
 * @type {Record<string, string>}
 */
exports.CUSTOM_API_CHAIN_IDS = {
  "secret-4": `https://skip-secretnetwork-api.lavenderfive.com`,
};

/**
 * @type {Record<string, string>}
 */
exports.CUSTOM_RPC_CHAIN_IDS = {
  "secret-4": `https://skip-secretnetwork-rpc.lavenderfive.com`,
};

/**
 * @type {Record<string, true | number>}
 */
exports.WHITELABEL_CHAIN_IDS = {
  "agoric-3": true,
  "akashnet-2": true,
  "andromeda-1": true,
  "archway-1": true,
  "aura_6322-2": true,
  "axelar-dojo-1": true,
  "bitsong-2b": true,
  "canto_7700-1": true,
  "carbon-1": true,
  "cataclysm-1": true,
  "centauri-1": true,
  "cheqd-mainnet-1": true,
  "chihuahua-1": true,
  "comdex-1": true,
  "core-1": true,
  "coreum-mainnet-1": true,
  "cosmoshub-4": true,
  "crescent-1": true,
  "cronosmainnet_25-1": true,
  "crypto-org-mainnet": true,
  dhealth: true,
  "dimension_37-1": true,
  "dydx-mainnet-1": true,
  "dymension_1100-1": true,
  "empowerchain-1": true,
  "evmos_9001-2": true,
  "fetchhub-4": true,
  "gravity-bridge-3": true,
  "haqq_11235-1": true,
  "injective-1": true,
  "jackal-1": true,
  "juno-1": true,
  "kaiyo-1": true,
  "kava_2222-10": true,
  "kyve-1": true,
  "laozi-mainnet": true,
  "lava-mainnet-1": true,
  "lum-network-1": true,
  "mantle-1": true,
  "mars-1": true,
  "migaloo-1": true,
  "neutron-1": true,
  "noble-1": true,
  "nois-1": true,
  "nomic-stakenet-3": true,
  "omniflixhub-1": true,
  "osmosis-1": true,
  "pacific-1": true,
  "passage-2": true,
  "penumbra-1": true,
  "perun-1": true,
  "phoenix-1": true,
  "pio-mainnet-1": true,
  "pirin-1": true,
  "planq_7070-2": true,
  "pryzm-1": true,
  "quasar-1": true,
  "quicksilver-2": true,
  "regen-1": true,
  "seda-1": true,
  "self-1": true,
  "sentinelhub-2": true,
  "sgenet-1": true,
  "shentu-22": true,
  "shido_9008-1": true,
  "sifchain-1": true,
  "sommelier-3": true,
  "source-1": true,
  "ssc-1": true,
  "stargaze-1": true,
  "stride-1": true,
  "stride-internal-1": true,
  "teritori-1": true,
  "umee-1": true,
  "ununifi-beta-v1": true,
  "vota-ash": true,
  "xstaxy-1": true,
  celestia: true,
  gitopia: true,
  nyx: true,
  wormchain: true,
};

/**
 * @type {Record<string, string>}
 */
exports.WHITELABEL_CUSTOM_NODE_IDS = {
  "crypto-org-chain-mainnet-1": "crypto-org-mainnet",
  "shentu-2.2": "shentu-22",
};
