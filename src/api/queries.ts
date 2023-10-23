import { Chain as SkipChain } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import * as chainRegistry from "chain-registry";

import { useSkipClient } from "@/solve";

export type Chain = {
  prettyName: string;
  record?: (typeof chainRegistry.chains)[number];
} & SkipChain;

export type UseChainsQueryArgs<T = Chain[]> = {
  select?: (arr?: Chain[]) => T;
};

export function useChains<T = Chain[]>(args: UseChainsQueryArgs<T> = {}) {
  const { select = (t) => t as T } = args;

  const skipRouter = useSkipClient();

  const { data, ...queryResult } = useQuery({
    queryKey: ["skip-api-chains"],
    queryFn: async () => {
      const chains = await skipRouter.chains({
        includeEVM: true,
      });

      return chains
        .map((chain) => {
          const record = chainRegistry.chains.find(
            (c) => c.chain_id === chain.chainID,
          );

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

  return {
    ...queryResult,
    chains: data,
  };
}

export function useChainByID(chainID: string) {
  const { chains, ...queryResult } = useChains({
    select: (chains) => (chains ?? []).find((c) => c.chainID === chainID),
  });

  return {
    ...queryResult,
    chain: chains,
  };
}
