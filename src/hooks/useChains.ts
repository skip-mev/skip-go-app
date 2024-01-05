import { Chain as SkipChain } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";

import { chainIdToPrettyName } from "@/chains/pretty";
import { useSkipClient } from "@/solve";

export type Chain = SkipChain & { prettyName: string };

export type UseChainsQueryArgs<T = Chain[]> = {
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
            prettyName: chainIdToPrettyName[chain.chainID] || chain.chainName,
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
  });
}

export function useChainByID(chainID: string) {
  return useChains({
    select: (chains) => (chains ?? []).find((c) => c.chainID === chainID),
  });
}