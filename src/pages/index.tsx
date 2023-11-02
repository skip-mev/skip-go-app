import { useManager } from "@cosmos-kit/react";
import { useEffect } from "react";

import { SwapWidget } from "@/components/SwapWidget";
import { WalletModalProvider } from "@/components/WalletModal";
import {
  failTxHistory,
  successTxHistory,
  useTxHistory,
} from "@/context/tx-history";
import { useSkipClient } from "@/solve";
import { useInterval } from "@/utils/hooks";
import { queryClient } from "@/utils/query";
import { getBalancesByChain } from "@/utils/utils";

export default function Home() {
  const { walletRepos } = useManager();
  const history = useTxHistory();
  const skipRouter = useSkipClient();

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

  async function updateTransactionHistory() {
    for (const [id, historyItem] of Object.entries(history)) {
      if (historyItem.status === "pending") {
        const firstTx =
          historyItem.txStatus.length > 0 ? historyItem.txStatus[0] : undefined;

        if (!firstTx) {
          continue;
        }

        const status = await skipRouter.transactionStatus({
          chainID: firstTx.chainId,
          txHash: firstTx.txHash,
        });

        if (status.state === "STATE_COMPLETED_SUCCESS") {
          successTxHistory(id);
        }

        if (status.state === "STATE_COMPLETED_ERROR") {
          failTxHistory(id);
        }
      }
    }
  }

  useInterval(() => {
    for (const repo of walletRepos) {
      if (repo.current && repo.current.address) {
        prefetchBalances(repo.current.address, repo.chainRecord.chain.chain_id);
      }
    }
  }, 5000);

  useEffect(() => {
    updateTransactionHistory();
  });

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
