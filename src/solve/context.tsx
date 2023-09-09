import { FC, PropsWithChildren, createContext } from "react";
import { SKIP_API_URL, SkipAPIClient } from "@skip-router/core";

export const SkipContext = createContext<
  | {
      skipClient: SkipAPIClient;
    }
  | undefined
>(undefined);

export const SkipProvider: FC<PropsWithChildren> = ({ children }) => {
  const skipClient = new SkipAPIClient(SKIP_API_URL, {
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
