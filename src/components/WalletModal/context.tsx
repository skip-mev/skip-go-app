import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

import { Dialog } from "@/elements/Dialog";

interface WalletModalContext {
  chainID: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openWalletModal: (chainID: string) => void;
}

const WalletModalContext = createContext<WalletModalContext | undefined>(
  undefined,
);

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error("useWalletModal must be used within a WalletModalProvider");
  }
  return context;
}

export const WalletModalProvider: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [chainID, setChainID] = useState("cosmoshub-4");

  return (
    <WalletModalContext.Provider
      value={{
        chainID,
        isOpen,
        openWalletModal: (_chainID) => {
          setIsOpen(true);
          setChainID(_chainID);
        },
        setIsOpen,
      }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Dialog>
    </WalletModalContext.Provider>
  );
};
