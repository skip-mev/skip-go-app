import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useState,
} from "react";

import { Dialog } from "@/elements/Dialog";

interface WalletModalContext {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  openWalletModal: () => void;
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

  return (
    <WalletModalContext.Provider
      value={{ isOpen, openWalletModal: () => setIsOpen(true), setIsOpen }}
    >
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {children}
      </Dialog>
    </WalletModalContext.Provider>
  );
};
