// @ts-check

/**
 * @typedef {{ endpoint: string | undefined; isPrivate: boolean; isApiKey?: boolean } | undefined} EndpointConfig
 */

/**
 * @typedef {(chainID: string) => MaybePromise<{endpoint: string[] | undefined; isPrivate: boolean; }>} FallbackEndpointFn
 */

/**
 * @typedef {{ chainName: string; isTestnet?: boolean }} WhitelabelChainConfig
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

  /** @type {WhitelabelChainConfig | undefined} */
  const config = exports.WHITELABEL_CHAINS[chainID];

  if (!config) {
    return undefined;
  }

  const prefix = type === "api" ? "lcd" : "rpc";
  const network = config.isTestnet ? "testnet" : "mainnet";

  return {
    endpoint: `https://${prefix}-${config.chainName}.${network}.cosmoslabs.kr`,
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
 * Maps chainID to the chain_name / network used in the whitelabel RPC/LCD hostname,
 * e.g. `rpc-{chainName}.{mainnet|testnet}.cosmoslabs.kr` / `lcd-{chainName}.{mainnet|testnet}.cosmoslabs.kr`.
 * @type {Record<string, WhitelabelChainConfig>}
 */
exports.WHITELABEL_CHAINS = {
  "agoric-3": { chainName: "agoric" },
  "akashnet-2": { chainName: "akash" },
  "althea_258432-1": { chainName: "althea" },
  "archway-1": { chainName: "archway" },
  "axelar-dojo-1": { chainName: "axelar" },
  "bbn-1": { chainName: "babylon" },
  celestia: { chainName: "celestia" },
  "chihuahua-1": { chainName: "chihuahua" },
  "cosmoshub-4": { chainName: "cosmos" },
  "crypto-org-chain-mainnet-1": { chainName: "crypto-org" },
  "dydx-mainnet-1": { chainName: "dydx" },
  "dymension_1100-1": { chainName: "dymension" },
  "fetchhub-4": { chainName: "fetchai" },
  "gravity-bridge-3": { chainName: "gravity-bridge" },
  "injective-1": { chainName: "injective" },
  "kava_2222-10": { chainName: "kava" },
  "kyve-1": { chainName: "kyve" },
  "ledger-mainnet-1": { chainName: "lombard" },
  "mantra-1": { chainName: "mantra" },
  "neutron-1": { chainName: "neutron" },
  "noble-1": { chainName: "noble" },
  nyx: { chainName: "nyx" },
  "osmosis-1": { chainName: "osmosis" },
  "core-1": { chainName: "persistence" },
  "pio-mainnet-1": { chainName: "provenance" },
  "regen-1": { chainName: "regen" },
  "ssc-1": { chainName: "saga" },
  "pacific-1": { chainName: "sei" },
  "sentinelhub-2": { chainName: "sentinel" },
  "shentu-2.2": { chainName: "shentu" },
  "stride-1": { chainName: "stride" },
  "phoenix-1": { chainName: "terra" },
  "coreum-mainnet-1": { chainName: "tx" },
  "xion-mainnet-1": { chainName: "xion" },
  "dimension_37-1": { chainName: "xpla" },
  "atomone-1": { chainName: "atomone" },
  "laozi-mainnet": { chainName: "band" },
  "humans_1089-1": { chainName: "humans" },
  "irishub-1": { chainName: "iris" },
  "panacea-3": { chainName: "medibloc" },
  "zetachain_7000-1": { chainName: "zeta" },
  "allora-mainnet-1": { chainName: "allora" },
  "andromeda-1": { chainName: "andromeda" },
  "aura_6322-2": { chainName: "aura" },
  "beezee-1": { chainName: "beezee" },
  "bitbadges-1": { chainName: "bitbadges" },
  "bitsong-2b": { chainName: "bitsong" },
  "bitway-1": { chainName: "bitway" },
  "canto_7700-1": { chainName: "canto" },
  "carbon-1": { chainName: "carbon" },
  "perun-1": { chainName: "chain4energy" },
  "cheqd-mainnet-1": { chainName: "cheqd" },
  "cronosmainnet_25-1": { chainName: "cronos" },
  "mainnet-3": { chainName: "decentr" },
  "vota-ash": { chainName: "dora" },
  "dungeon-1": { chainName: "dungeon" },
  gitopia: { chainName: "gitopia" },
  "haqq_11235-1": { chainName: "haqq" },
  "interwoven-1": { chainName: "initia" },
  "int3face-1": { chainName: "int3face" },
  "ixo-5": { chainName: "ixo" },
  "juno-1": { chainName: "juno" },
  "lava-mainnet-1": { chainName: "lava" },
  "lumera-mainnet-1": { chainName: "lumera" },
  "cataclysm-1": { chainName: "nibiru" },
  "pirin-1": { chainName: "nolus" },
  Oraichain: { chainName: "oraichain" },
  "passage-2": { chainName: "passage" },
  "penumbra-1": { chainName: "penumbra" },
  "planq_7070-2": { chainName: "planq" },
  "quicksilver-2": { chainName: "quicksilver" },
  "seda-1": { chainName: "seda" },
  "shido_9008-1": { chainName: "shido" },
  "sommelier-3": { chainName: "sommelier" },
  "source-1": { chainName: "source" },
  "sunrise-1": { chainName: "sunrise" },
  "columbus-5": { chainName: "terra-classic" },
  wormchain: { chainName: "wormchain" },
  "xrplevm_1440000-1": { chainName: "xrplevm" },
  "zigchain-1": { chainName: "zigchain" },
  "axelar-testnet-lisbon-3": { chainName: "axelar", isTestnet: true },
  "bbn-test-6": { chainName: "babylon", isTestnet: true },
  "mocha-5": { chainName: "celestia", isTestnet: true },
  provider: { chainName: "cosmos", isTestnet: true },
  "ledger-testnet-1": { chainName: "lombard", isTestnet: true },
  "pion-1": { chainName: "neutron", isTestnet: true },
  "grand-1": { chainName: "noble", isTestnet: true },
  "osmo-test-5": { chainName: "osmosis", isTestnet: true },
  "test-core-2": { chainName: "persistence", isTestnet: true },
  "ssc-testnet-3": { chainName: "saga", isTestnet: true },
  "dydx-testnet-4": { chainName: "dydx", isTestnet: true },
  "injective-888": { chainName: "injective", isTestnet: true },
  "kava_2221-16000": { chainName: "kava", isTestnet: true },
  "mantra-dukong-1": { chainName: "mantra", isTestnet: true },
  "coreum-testnet-1": { chainName: "tx", isTestnet: true },
  "xion-testnet-2": { chainName: "xion", isTestnet: true },
  "allora-testnet-1": { chainName: "allora", isTestnet: true },
  "initiation-2": { chainName: "initia", isTestnet: true },
  "oro_1336-1": { chainName: "kiichain", isTestnet: true },
  "seda-1-testnet": { chainName: "seda", isTestnet: true },
  "barra_9191-1": { chainName: "warden", isTestnet: true },
  "xrplevm_1449000-1": { chainName: "xrplevm", isTestnet: true },
  "zig-test-2": { chainName: "zigchain", isTestnet: true },
};
