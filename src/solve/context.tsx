import { useManager } from "@cosmos-kit/react";
import { SkipRouter } from "@skip-router/core";
import { getWalletClient } from "@wagmi/core";
import { createContext, ReactNode } from "react";
import { useNetwork as useWagmiNetwork } from "wagmi";

import { chainIdToName } from "@/chains/types";
import { API_URL } from "@/constants/api";
import { OVERRIDE_REST_ENDPOINTS, OVERRIDE_RPC_ENDPOINTS } from "@/constants/endpoints";
import { trackWallet } from "@/context/track-wallet";
import { getNodeProxyEndpoint } from "@/utils/api";
import { isWalletClientUsingLedger } from "@/utils/wallet";

export const SkipContext = createContext<{ skipClient: SkipRouter } | undefined>(undefined);

export function SkipProvider({ children }: { children: ReactNode }) {
  const { chains } = useWagmiNetwork();
  const { getWalletRepo } = useManager();

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

      let wallet = getWalletRepo(chainName).wallets.find((w) => {
        return w.walletName === walletName;
      });
      wallet ??= getWalletRepo(chainName).wallets.find((w) => {
        return w.isWalletConnected && !w.isWalletDisconnected;
      });

      if (!wallet) {
        throw new Error(`getCosmosSigner error: unable to find cosmos wallets connected to '${chainID}'`);
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
      const evmWalletClient = await getWalletClient({
        chainId: parseInt(chainID),
      });

      if (!evmWalletClient) {
        throw new Error(`getEVMSigner error: no wallet client available for chain ${chainID}`);
      }

      const chain = chains.find(({ id }) => id === parseInt(chainID));
      if (!chain) {
        throw new Error(`getEVMSigner error: cannot find chain with id ${chainID}`);
      }

      // TODO: figure out why we re-assign evm chain on wallet client
      evmWalletClient.chain = chain;

      return evmWalletClient;
    },
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        return OVERRIDE_RPC_ENDPOINTS[chainID] || getNodeProxyEndpoint(chainID);
      },
      getRestEndpointForChain: async (chainID) => {
        return OVERRIDE_REST_ENDPOINTS[chainID] || getNodeProxyEndpoint(chainID);
      },
    },
  });

  return <SkipContext.Provider value={{ skipClient }}>{children}</SkipContext.Provider>;
}
