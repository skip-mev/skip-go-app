import { FC, PropsWithChildren, createContext } from "react";
import { SkipClient } from "./client";
import { IGNORE_CHAINS } from "@/config";

export const SkipContext = createContext<
  | {
      skipClient: SkipClient;
    }
  | undefined
>(undefined);

export const SkipProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SkipContext.Provider value={{ skipClient: new SkipClient(IGNORE_CHAINS) }}>
      {children}
    </SkipContext.Provider>
  );
};
