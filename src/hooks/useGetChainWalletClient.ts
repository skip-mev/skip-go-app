import { useManager } from "@cosmos-kit/react";
import { useCallback } from "react";

export function useGetChainWalletClient() {
  const { getWalletRepo } = useManager();

  const getter = useCallback(
    (chainName: string) => {
      const repo = getWalletRepo(chainName);

      const currentWallet = localStorage.getItem(
        "cosmos-kit@2:core//current-wallet",
      );
      if (!currentWallet) {
        throw new Error("No CosmosKit wallet found");
      }

      const wallet = repo.getWallet(currentWallet);
      if (!wallet) {
        throw new Error("No wallet found");
      }
      return wallet.client;
    },
    [getWalletRepo],
  );

  return getter;
}
