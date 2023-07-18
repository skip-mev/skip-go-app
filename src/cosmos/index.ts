import { Chain } from "@/context/chains";
import { getStargateClientForChainID } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface Asset {
  denom: string;
  type: string;
  origin_chain: string;
  origin_denom: string;
  origin_type: string;
  symbol: string;
  decimals: number;
  description?: string;
  image: string;
  coinGeckoId?: string;
  chainID: string;
}

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
    "mars-1": "mars-protocol",
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

export async function getBalancesByChain(address: string, chainID: string) {
  const client = await getStargateClientForChainID(chainID);

  const balances = await client.getAllBalances(address);

  return balances.reduce((acc, balance) => {
    return {
      ...acc,
      [balance.denom]: balance.amount,
    };
  }, {} as Record<string, string>);
}

export function useBalancesByChain(
  address?: string,
  chain?: Chain,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["balances-by-chain", address, chain?.chain_id],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      const balances = await getBalancesByChain(address, chain.chain_id);

      return balances;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
    enabled: !!chain && !!address && enabled,
  });
}
