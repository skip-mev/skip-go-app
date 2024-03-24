import { useManager } from "@cosmos-kit/react";
import { SkipRouter } from "@skip-router/core";
import { useWallet } from "@solana/wallet-adapter-react";
import { getWalletClient } from "@wagmi/core";
import { createContext, ReactNode, useMemo } from "react";
import { WalletClient } from "viem";

import { chainIdToName } from "@/chains/types";
import { API_URL, appUrl } from "@/constants/api";
import { trackWallet } from "@/context/track-wallet";
import { config } from "@/lib/wagmi";
import { gracefullyConnect, isWalletClientUsingLedger } from "@/utils/wallet";

export const SkipContext = createContext<{ skipClient: SkipRouter } | undefined>(undefined);

export function SkipProvider({ children }: { children: ReactNode }) {
  const { getWalletRepo } = useManager();
  const { wallets } = useWallet();

  const skipClient = new SkipRouter({
    clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
    apiURL: API_URL,
    getCosmosSigner: async (chainID) => {
      const chainName = chainIdToName[chainID];
      if (!chainName) {
        throw new Error(`getCosmosSigner error: unknown chainID '${chainID}'`);
      }

      const walletName = (() => {
        const { source, destination } = trackWallet.get();
        if (source?.chainType === "cosmos") return source.walletName;
        if (destination?.chainType === "cosmos") return destination.walletName;
      })();

      const wallet = getWalletRepo(chainName).wallets.find((w) => {
        return w.walletName === walletName;
      });

      if (!wallet) {
        throw new Error(`getCosmosSigner error: unable to find wallets connected to '${chainID}'`);
      }

      if (!wallet.isWalletConnected || wallet.isWalletDisconnected) {
        await gracefullyConnect(wallet);
      }

      const isLedger = await isWalletClientUsingLedger(wallet.client, chainID);
      await wallet.initOfflineSigner(isLedger ? "amino" : "direct");

      if (!wallet.offlineSigner) {
        throw new Error(`getCosmosSigner error: no offline signer for walletName '${walletName}'`);
      }

      wallet.client.setDefaultSignOptions?.({
        preferNoSetFee: true,
      });

      return wallet.offlineSigner;
    },
    getEVMSigner: async (chainID) => {
      const evmWalletClient = (await getWalletClient(config, {
        chainId: parseInt(chainID),
      })) as WalletClient;

      if (!evmWalletClient) {
        throw new Error(`getEVMSigner error: no wallet client available for chain ${chainID}`);
      }

      return evmWalletClient;
    },
    getSVMSigner: async () => {
      const walletName = (() => {
        const { source, destination } = trackWallet.get();
        if (source?.chainType === "svm") return source.walletName;
        if (destination?.chainType === "svm") return destination.walletName;
      })();
      const solanaWallet = wallets.find((w) => w.adapter.name === walletName);

      if (!solanaWallet?.adapter) {
        throw new Error(`getSVMSigner error: no wallet client available`);
      }

      return solanaWallet.adapter;
    },
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        return `${appUrl}/api/rpc/${chainID}`;
      },
      getRestEndpointForChain: async (chainID) => {
        return `${appUrl}/api/rest/${chainID}`;
      },
    },
  });

  return <SkipContext.Provider value={{ skipClient }}>{children}</SkipContext.Provider>;
}
