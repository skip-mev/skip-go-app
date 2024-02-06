export const ALLOWLIST_LAVENDER_FIVE_CHAIN_IDS = [
  "secret-4",
  //
];

export const ALLOWLIST_POLKACHU_BACKUP_CHAIN_IDS = [
  "osmosis-1",
  //
];

export const OVERRIDE_REST_ENDPOINTS: Record<string, string> = {
  "evmos_9001-2": "https://evmos-api.polkachu.com",
  "injective-1": "https://lcd.injective.network",
  "dymension_1100-1": "https://dymension-api.polkachu.com",
};

export const OVERRIDE_RPC_ENDPOINTS: Record<string, string> = {
  "axelar-testnet-lisbon-3": "https://axelar-testnet-rpc.polkachu.com",
  "osmo-test-5": "https://osmosis-testnet-rpc.polkachu.com",
  "pion-1": "https://neutron-testnet-rpc.polkachu.com",
};
