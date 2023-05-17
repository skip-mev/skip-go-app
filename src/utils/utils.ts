export function chainIDToChainlistName(chainID: string) {
  console;
  const map: Record<string, string> = {
    "cosmoshub-4": "cosmos",
    "osmosis-1": "osmosis",
    "juno-1": "juno",
    "evmos_9001-2": "evmos",
    "stride-1": "stride",
    "gravity-bridge-3": "gravity-bridge",
    "axelar-dojo-1": "axelar",
  };

  if (map[chainID]) {
    return map[chainID];
  }

  return chainID;
}

export function formatAddress(address: string, prefix: string) {
  return address.slice(0, prefix.length + 2) + "..." + address.slice(-4);
}
