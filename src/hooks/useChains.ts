import { Chain as SkipChain } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";

import { chainIdToName } from "@/chains";
import { chainIdToPrettyName } from "@/chains/pretty";
import { useSkipClient } from "@/solve";

export type Chain = SkipChain & {
  prettyName: string;
  registryChainName: string;
};

export type UseChainsQueryArgs<T = Chain[]> = {
  enabled?: boolean;
  select?: (arr?: Chain[]) => T;
};

export function useChains<T = Chain[]>(args: UseChainsQueryArgs<T> = {}) {
  const { select = (t) => t as T } = args;

  const skipClient = useSkipClient();

  return useQuery({
    queryKey: ["skip-api-chains"],
    queryFn: async () => {
      const chains = await skipClient.chains({
        includeEVM: true,
      });

      return chains
        .map((chain): Chain => {
          return {
            ...chain,
            chainName: chainIdToName[chain.chainID] || chain.chainName,
            prettyName: chainIdToPrettyName[chain.chainID] || chain.chainName,
            registryChainName: chainIdToName[chain.chainID],
          };
        })
        .sort((chainA, chainB) => {
          return chainA.prettyName.localeCompare(chainB.prettyName);
        });
    },
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    select,
    enabled: args.enabled,
  });
}

export function useChainByID(chainID?: string) {
  return useChains({
    select: (chains) => (chains ?? []).find((c) => c.chainID === chainID),
    enabled: Boolean(chainID),
  });
}
