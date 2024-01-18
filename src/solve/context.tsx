import { useManager } from "@cosmos-kit/react";
import { SkipRouter } from "@skip-router/core";
import { getWalletClient } from "@wagmi/core";
import { createContext, ReactNode } from "react";
import { useNetwork as useWagmiNetwork } from "wagmi";

import { chainIdToName } from "@/chains";
import { API_URL } from "@/constants/api";
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

      const walletName = trackWallet.get().source?.walletName;
      const wallet = getWalletRepo(chainName).wallets.find((w) => {
        return w.walletName === walletName;
      });

      if (!wallet) {
        throw new Error(`getCosmosSigner error: unknown walletName '${walletName}'`);
      }

      const isLedger = await isWalletClientUsingLedger(wallet.client, chainID);
      await wallet.initOfflineSigner(isLedger ? "amino" : "direct");

      if (!wallet.offlineSigner) {
        throw new Error(`getCosmosSigner error: no offlineSigner for walletName '${walletName}'`);
      }

      return wallet.offlineSigner;
    },
    getEVMSigner: async (chainID) => {
      const result = await getWalletClient({
        chainId: parseInt(chainID),
      });

      if (!result) {
        throw new Error("No offline signer available");
      }

      const chain = chains.find((c) => c.id === parseInt(chainID));
      if (!chain) {
        throw new Error("No chain found");
      }
      result.chain = chain;

      return result;
    },
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        const testnets: Record<string, string> = {
          "osmo-test-5": "https://osmosis-testnet-rpc.polkachu.com",
          "pion-1": "https://neutron-testnet-rpc.polkachu.com",
          "axelar-testnet-lisbon-3": "https://axelar-testnet-rpc.polkachu.com",
        };

        if (testnets[chainID]) {
          return testnets[chainID];
        }

        return getNodeProxyEndpoint(chainID);
      },
      getRestEndpointForChain: async (chainID) => {
        if (chainID === "injective-1") {
          return "https://lcd.injective.network";
        }

        if (chainID === "evmos_9001-2") {
          return "https://evmos-api.polkachu.com";
        }

        return getNodeProxyEndpoint(chainID);
      },
    },
  });

  return <SkipContext.Provider value={{ skipClient }}>{children}</SkipContext.Provider>;
}
