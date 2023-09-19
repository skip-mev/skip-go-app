import { useManager } from "@cosmos-kit/react";

import { SwapWidget } from "@/components/SwapWidget";
import { WalletModalProvider } from "@/components/WalletModal";
import { getBalancesByChain } from "@/cosmos";
import { useInterval } from "@/utils/hooks";
import { queryClient } from "@/utils/query";

export default function Home() {
  const { walletRepos } = useManager();

  async function prefetchBalances(address: string, chainID: string) {
    try {
      const balances = await getBalancesByChain(address, chainID);

      queryClient.setQueryData(
        ["balances-by-chain", address, chainID],
        balances,
      );
    } catch {
      /* empty */
    }
  }

  useInterval(() => {
    for (const repo of walletRepos) {
      if (repo.current && repo.current.address) {
        prefetchBalances(repo.current.address, repo.chainRecord.chain.chain_id);
      }
    }
  }, 5000);

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow-xl rounded-3xl p-6 py-6 relative">
        <WalletModalProvider>
          <SwapWidget />
        </WalletModalProvider>
      </div>
    </div>
  );
}
