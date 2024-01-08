import { useManager } from "@cosmos-kit/react";
import { useMemo } from "react";
import { useAccount as useWagmiAccount } from "wagmi";

import { EVM_WALLET_LOGOS, INJECTED_EVM_WALLET_LOGOS } from "@/constants/wagmi";
import { useChainByID } from "@/hooks/useChains";

export function useAccount(chainID?: string) {
  const { data: chain } = useChainByID(chainID);

  const { getWalletRepo } = useManager();
  const cosmosAccount = useMemo(() => {
    if (chain?.chainType !== "cosmos") return;
    const { wallets } = getWalletRepo(chain.chainName);
    return wallets.find((w) => w.isActive);
  }, [chain, getWalletRepo]);

  const wagmiAccount = useWagmiAccount();

  const account = useMemo(() => {
    if (!chain) return;
    if (chain.chainType === "cosmos" && cosmosAccount) {
      return {
        address: cosmosAccount.address,
        isWalletConnected: cosmosAccount.isWalletConnected,
        wallet: cosmosAccount
          ? {
              walletName: cosmosAccount.walletInfo.name,
              walletPrettyName: cosmosAccount.walletInfo.prettyName,
              walletInfo: {
                logo: cosmosAccount.walletInfo.logo,
              },
            }
          : undefined,
      };
    }
    if (chain.chainType === "evm") {
      return {
        address: wagmiAccount.address,
        isWalletConnected: wagmiAccount.isConnected,
        wallet: wagmiAccount.connector
          ? {
              walletName: wagmiAccount.connector.id,
              walletPrettyName: wagmiAccount.connector.name,
              walletInfo: {
                logo:
                  wagmiAccount.connector.id === "injected"
                    ? INJECTED_EVM_WALLET_LOGOS[wagmiAccount.connector.name]
                    : EVM_WALLET_LOGOS[wagmiAccount.connector.id],
              },
            }
          : undefined,
      };
    }
  }, [chain, cosmosAccount, wagmiAccount]);

  return account;
}
