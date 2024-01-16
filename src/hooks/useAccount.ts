import { useChain as useCosmosChain } from "@cosmos-kit/react";
import { useMemo } from "react";
import { useAccount as useWagmiAccount } from "wagmi";

import { EVM_WALLET_LOGOS, INJECTED_EVM_WALLET_LOGOS } from "@/constants/wagmi";
import { TrackWalletCtx, useTrackWalletByCtx } from "@/context/track-wallet";
import { useChainByID } from "@/hooks/useChains";

export function useAccount(context: TrackWalletCtx) {
  const trackedWallet = useTrackWalletByCtx(context);

  const { data: chain } = useChainByID(trackedWallet?.chainID);

  const { walletRepo } = useCosmosChain(
    chain?.chainType === "cosmos" ? chain.chainName : "cosmoshub",
    true,
  );

  const cosmosWallet = walletRepo.wallets.find((w) => {
    return w.walletName === trackedWallet?.walletName;
  });

  const wagmiAccount = useWagmiAccount();

  const account = useMemo(() => {
    if (!chain) return;
    if (chain.chainType === "cosmos" && cosmosWallet) {
      return {
        address: cosmosWallet.address,
        isWalletConnected:
          cosmosWallet.isWalletConnected && !cosmosWallet.isWalletDisconnected,
        wallet: cosmosWallet
          ? {
              walletName: cosmosWallet.walletInfo.name,
              walletPrettyName: cosmosWallet.walletInfo.prettyName,
              walletInfo: {
                logo: cosmosWallet.walletInfo.logo,
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
  }, [chain, cosmosWallet, wagmiAccount]);

  return account;
}
