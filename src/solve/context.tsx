import { useWalletClient } from "@cosmos-kit/react";
import { SkipRouter } from "@skip-router/core";
import { getWalletClient } from "@wagmi/core";
import { createContext, FC, PropsWithChildren } from "react";
import { useNetwork } from "wagmi";

import {
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  isLedger,
} from "@/utils/utils";

export const SkipContext = createContext<
  | {
      skipClient: SkipRouter;
    }
  | undefined
>(undefined);

export const SkipProvider: FC<PropsWithChildren> = ({ children }) => {
  const { client: walletClient } = useWalletClient();
  const { chains } = useNetwork();

  const skipClient = new SkipRouter({
    apiURL: "https://solve-dev.skip.money",
    getCosmosSigner: async (chainID) => {
      if (!walletClient) {
        throw new Error("No offline signer available");
      }

      const signerIsLedger = await isLedger(walletClient, chainID);

      if (signerIsLedger) {
        return getOfflineSignerOnlyAmino(walletClient, chainID);
      }

      return getOfflineSigner(walletClient, chainID);
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

        return `https://ibc.fun/nodes/${chainID}`;
      },
      getRestEndpointForChain: async (chainID) => {
        if (chainID === "injective-1") {
          return "https://lcd.injective.network";
        }

        return `https://ibc.fun/nodes/${chainID}`;
      },
    },
  });

  return (
    <SkipContext.Provider
      value={{
        skipClient: skipClient,
      }}
    >
      {children}
    </SkipContext.Provider>
  );
};
