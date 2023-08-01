import { Fragment, useMemo } from "react";
import va from "@vercel/analytics";
import { useManager } from "@cosmos-kit/react";
import { queryClient } from "@/utils/query";
import { getBalancesByChain } from "@/cosmos";
import { useInterval } from "@/utils/hooks";
import { SwapWidget } from "@/components/SwapWidget";

export default function Home() {
  const { walletRepos } = useManager();

  async function prefetchBalances(address: string, chainID: string) {
    try {
      const balances = await getBalancesByChain(address, chainID);

      queryClient.setQueryData(
        ["balances-by-chain", address, chainID],
        balances
      );
    } catch {}
  }

  useInterval(() => {
    for (const repo of walletRepos) {
      if (repo.current && repo.current.address) {
        prefetchBalances(repo.current.address, repo.chainRecord.chain.chain_id);
      }
    }
  }, 5000);

  return (
    <div className="max-w-lg mx-auto">
      <SwapWidget />
    </div>
  );
}
