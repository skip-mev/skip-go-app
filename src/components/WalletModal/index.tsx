import { ChainWalletBase } from "@cosmos-kit/core";
import { useManager } from "@cosmos-kit/react";
import { FC, useState } from "react";

import { Dialog, DialogContent, DialogTrigger } from "@/elements/Dialog";
import { getChainByID } from "@/utils/utils";

import WalletModalTrigger from "./WalletModalTrigger";

const WalletModal: FC<{ chainID: string }> = ({ chainID }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { getWalletRepo } = useManager();

  const walletRepo = getWalletRepo(getChainByID(chainID).chain_name);

  async function onWalletConnect(wallet: ChainWalletBase) {
    const currentWallet = walletRepo.current;

    await wallet.connect(true);

    // if (!wallet.isWalletConnected) {
    //   await currentWallet?.connect();
    // }

    setIsOpen(false);
  }

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger>
          <WalletModalTrigger chainID={chainID} />
        </DialogTrigger>
        <DialogContent>
          <div className="py-5">
            <p className="text-center font-bold">Wallets</p>
          </div>
          <div className="px-4 space-y-2">
            {walletRepo.wallets.map((wallet) => (
              <button
                className="flex items-center gap-2 w-full p-2 rounded-lg transition-colors hover:bg-[#FF486E]/20"
                key={wallet.walletName}
                onClick={() => onWalletConnect(wallet)}
              >
                {wallet.walletInfo.logo && (
                  <img
                    alt={wallet.walletPrettyName}
                    className="w-9 h-9"
                    src={wallet.walletInfo.logo}
                  />
                )}
                <p className="font-semibold">{wallet.walletPrettyName}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WalletModal;
