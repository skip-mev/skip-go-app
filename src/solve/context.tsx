import { useWalletClient } from "@cosmos-kit/react";
import { SkipRouter } from "@skip-router/core";
import { createContext, FC, PropsWithChildren } from "react";
import { API_URL } from "./env";

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

  const skipClient = new SkipRouter({
    apiURL: API_URL,
    getOfflineSigner: async (chainID) => {
      if (!walletClient) {
        throw new Error("No offline signer available");
      }

      const signerIsLedger = await isLedger(walletClient, chainID);

      if (signerIsLedger) {
        return getOfflineSignerOnlyAmino(walletClient, chainID);
      }
      return getOfflineSigner(walletClient, chainID);
    },
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
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
