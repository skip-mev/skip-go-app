import { WalletClient } from "@cosmos-kit/core";
import { useManager as useCosmosManager } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount as useWagmiAccount } from "wagmi";

import { EVM_WALLET_LOGOS, INJECTED_EVM_WALLET_LOGOS } from "@/constants/wagmi";
import { trackWallet, TrackWalletCtx, useTrackWallet } from "@/context/track-wallet";
import { useChainByID } from "@/hooks/useChains";
import { isReadyToCheckLedger, isWalletClientUsingLedger } from "@/utils/wallet";

export function useAccount(context: TrackWalletCtx) {
  const trackedWallet = useTrackWallet(context);

  const { data: chain } = useChainByID(trackedWallet?.chainID);
  const { getWalletRepo } = useCosmosManager();

  const cosmosWallet = useMemo(() => {
    if (chain?.chainType !== "cosmos") return;
    const { wallets } = getWalletRepo(chain.chainName);
    return wallets.find((w) => w.walletName === trackedWallet?.walletName);
  }, [chain?.chainName, chain?.chainType, getWalletRepo, trackedWallet?.walletName]);

  const wagmiAccount = useWagmiAccount();

  const getIsLedger = async (client: WalletClient, chainId: string) => {
    const isLedger = await isWalletClientUsingLedger(client, chainId);
    return isLedger;
  };

  const readyToCheckLedger = useMemo(() => {
    if (!cosmosWallet?.client) return false;
    return isReadyToCheckLedger(cosmosWallet?.client);
  }, [cosmosWallet?.client]);

  const cosmosWalletIsLedgerQuery = useQuery({
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "cosmosWallet",
      { context, cosmosWallet: cosmosWallet?.walletName, address: cosmosWallet?.address, chainID: chain?.chainID },
    ],
    queryFn: () => {
      if (!cosmosWallet?.client || !chain) return;
      return getIsLedger(cosmosWallet.client, chain.chainID);
    },
    enabled:
      chain &&
      chain.chainType === "cosmos" &&
      !!cosmosWallet &&
      context === "source" &&
      readyToCheckLedger &&
      !!cosmosWallet?.address,
  });

  const account = useMemo(() => {
    trackedWallet;
    if (!chain) return;
    if (chain.chainType === "cosmos" && cosmosWallet) {
      return {
        address: cosmosWallet.address,
        isWalletConnected: cosmosWallet.isWalletConnected && !cosmosWallet.isWalletDisconnected,
        wallet: cosmosWallet
          ? {
              walletName: cosmosWallet.walletInfo.name,
              walletPrettyName: cosmosWallet.walletInfo.prettyName,
              walletInfo: {
                logo: cosmosWallet.walletInfo.logo,
              },
              isLedger: cosmosWalletIsLedgerQuery.data,
            }
          : undefined,
        chainType: chain.chainType,
        connect: () => {
          return cosmosWallet.connect().then(() => {
            trackWallet.track(context, chain.chainID, cosmosWallet.walletName, chain.chainType);
          });
        },
        disconnect: () => {
          return cosmosWallet.disconnect().then(() => {
            trackWallet.untrack(context);
          });
        },
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
        chainType: chain.chainType,
        connect: () => {
          return wagmiAccount.connector?.connect().then(() => {
            trackWallet.track(context, chain.chainID, wagmiAccount.connector!.id, chain.chainType);
          });
        },
        disconnect: () => {
          return wagmiAccount.connector?.disconnect().then(() => {
            trackWallet.untrack(context);
          });
        },
      };
    }
  }, [chain, context, cosmosWallet, trackedWallet, wagmiAccount, cosmosWalletIsLedgerQuery.data]);

  return account;
}
