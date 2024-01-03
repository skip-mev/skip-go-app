import { Chain as SkipChain } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";

import { chainRecord } from "@/chains";
import { useSkipClient } from "@/solve";

export type Chain = {
  prettyName: string;
  record?: (typeof chainRecord)[string];
} & SkipChain;

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
          const record = chainRecord[chain.chainID];
          return {
            ...chain,
            prettyName: record?.pretty_name ?? chain.chainName,
            record,
          };
        })
        .sort((chainA, chainB) => {
          return chainA.prettyName.localeCompare(chainB.prettyName);
        });
    },
    select,
  });
}

export function useChainByID(chainID: string) {
  return useChains({
    select: (chains) => (chains ?? []).find((c) => c.chainID === chainID),
  });
}
