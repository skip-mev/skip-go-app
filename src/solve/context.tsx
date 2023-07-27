import { FC, PropsWithChildren, createContext } from "react";
import { SkipClient } from "./client";

export const SkipContext = createContext<
  | {
      skipClient: SkipClient;
    }
  | undefined
>(undefined);

export const SkipProvider: FC<PropsWithChildren> = ({ children }) => {
  return (
    <SkipContext.Provider value={{ skipClient: new SkipClient() }}>
      {children}
    </SkipContext.Provider>
  );
};
