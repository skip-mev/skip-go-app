import { FC, PropsWithChildren, createContext } from "react";
import { SKIP_API_URL, SkipAPIClient } from "@skip-router/core";

export const SkipContext = createContext<
  | {
      skipClient: SkipAPIClient;
    }
  | undefined
>(undefined);

export const SkipProvider: FC<PropsWithChildren> = ({ children }) => {
  const skipClient = new SkipAPIClient("https://solve-dev.skip.money", {
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
    getOfflineSigner: async () => {
      throw new Error("Not implemented");
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
