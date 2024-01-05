import { useChain } from "@cosmos-kit/react";
import { useAccount as useWagmiAccount } from "wagmi";

import { useChainByID } from "@/api/queries";
import { EVM_WALLET_LOGOS } from "@/constants/wagmi";

export function useAccount(chainID: string) {
  const { data: chain } = useChainByID(chainID);

  const cosmosChain = useChain(chain?.chainName ?? "cosmoshub");

  const wagmiAccount = useWagmiAccount();

  if (chain?.chainType === "evm") {
    return {
      address: wagmiAccount.address,
      isWalletConnected: wagmiAccount.isConnected,
      wallet: wagmiAccount.connector
        ? {
            walletName: wagmiAccount.connector.id,
            walletPrettyName: wagmiAccount.connector.name,
            walletInfo: {
              logo: EVM_WALLET_LOGOS[wagmiAccount.connector.id],
            },
          }
        : undefined,
    };
  }

  return {
    address: cosmosChain.address,
    isWalletConnected: cosmosChain.isWalletConnected,
    wallet: cosmosChain.wallet
      ? {
          walletName: cosmosChain.wallet.name,
          walletPrettyName: cosmosChain.wallet.prettyName,
          walletInfo: {
            logo: cosmosChain.wallet.logo,
          },
        }
      : undefined,
  };
}
