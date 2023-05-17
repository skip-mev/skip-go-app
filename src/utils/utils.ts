export function chainIDToChainlistName(chainID: string) {
  const map: Record<string, string> = {
    "cosmoshub-4": "cosmos",
    "osmosis-1": "osmosis",
    "juno-1": "juno",
  };

  if (map[chainID]) {
    return map[chainID];
  }

  return chainID;
}
