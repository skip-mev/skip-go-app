import { FC, PropsWithChildren, createContext, useContext } from "react";
import { useSolveChains } from "@/solve/queries";
import { Chain as SolveChain, useSkipClient } from "@/solve";
import { ChainRecord } from "@cosmos-kit/core";
import { useManager } from "@cosmos-kit/react";

export interface Chain extends SolveChain {
  prettyName: string;
  record?: ChainRecord;
}

interface ChainsContext {
  chains: Chain[];
}

export const ChainsContext = createContext<ChainsContext>({
  chains: [],
});

export const ChainsProvider: FC<PropsWithChildren> = ({ children }) => {
  const skipClient = useSkipClient();
  const { data: supportedChains } = useSolveChains(skipClient);

  const { chainRecords, walletRepos } = useManager();

  const chains = (
    supportedChains
      ? supportedChains.map((c) => {
          const record = chainRecords.find(
            (record) => record.chain.chain_id === c.chain_id
          );

          const prettyName = record?.chain.pretty_name ?? c.chain_name;

          return {
            ...c,
            record,
            prettyName,
          };
        })
      : []
  ).sort((a, b) => {
    const repoA = walletRepos.find((repo) => repo.chainName === a.chain_name);
    const repoB = walletRepos.find((repo) => repo.chainName === b.chain_name);

    if (repoA && repoB) {
      if (repoA.current && !repoB.current) {
        return -1;
      }

      if (!repoA.current && repoB.current) {
        return 1;
      }
    }

    if (a.prettyName < b.prettyName) {
      return -1;
    }

    if (a.prettyName > b.prettyName) {
      return 1;
    }

    return 0;
  });

  return (
    <ChainsContext.Provider value={{ chains }}>
      {children}
    </ChainsContext.Provider>
  );
};

export function useChains() {
  return useContext(ChainsContext);
}
