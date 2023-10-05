import { useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { FC } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { useChainByChainID } from "@/api/queries";
import { EVM_WALLET_LOGOS } from "@/constants/constants";
import { DialogContent } from "@/elements/Dialog";
import { getChainByID } from "@/utils/utils";

import { useWalletModal } from "./context";

export interface MinimalWallet {
  walletName: string;
  walletPrettyName: string;
  walletInfo: {
    logo?: string | { major: string; minor: string };
  };
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  isWalletConnected: boolean;
}

interface Props {
  wallets: MinimalWallet[];
  onClose: () => void;
}

export const WalletModal: FC<Props> = ({ onClose, wallets }) => {
  async function onWalletConnect(wallet: MinimalWallet) {
    await wallet.connect();
    onClose();
  }

  return (
    <div>
      <div className="py-6 px-4 relative">
        <p className="text-center font-bold">Wallets</p>
        <div className="absolute inset-y-0 flex items-center">
          <button
            aria-label="Close wallet modal"
            className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="px-4 py-2 space-y-2">
        {wallets.map((wallet) => (
          <div className="group relative" key={wallet.walletName}>
            <button
              className="flex items-center gap-2 w-full p-2 rounded-lg transition-colors group-hover:bg-[#FF486E]/20"
              onClick={() => onWalletConnect(wallet)}
            >
              {wallet.walletInfo.logo && (
                <img
                  alt={wallet.walletPrettyName}
                  className="w-9 h-9"
                  src={
                    typeof wallet.walletInfo.logo === "string"
                      ? wallet.walletInfo.logo
                      : wallet.walletInfo.logo.major
                  }
                  aria-hidden="true"
                />
              )}
              <p className="font-semibold text-left flex-1">
                {wallet.walletPrettyName === "Leap Cosmos MetaMask"
                  ? "Metamask"
                  : wallet.walletPrettyName}
              </p>
            </button>
            {wallet.isWalletConnected ? (
              <button
                aria-label={`Disconnect ${wallet.walletPrettyName}`}
                className="bg-[#FF486E]/20 group-hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 flex items-center gap-1 transition-colors focus:outline-none absolute right-2 top-1/2 -translate-y-1/2"
                onClick={async (e) => {
                  e.stopPropagation();

                  await wallet.disconnect();

                  onClose();
                }}
              >
                Disconnect
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const WalletModalWithContext: FC = () => {
  const { connector: currentConnector } = useAccount();
  const { chainID } = useWalletModal();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const { getWalletRepo } = useManager();

  const { setIsOpen } = useWalletModal();

  const { chain } = useChainByChainID(chainID);

  if (!chain) {
    return null;
  }

  const { chainType } = chain;

  let wallets: MinimalWallet[] = [];

  if (chainType === "cosmos") {
    const chainName = getChainByID(chainID).chain_name;

    const walletRepo = getWalletRepo(chainName);

    wallets = walletRepo.wallets;
  }

  if (chainType === "evm") {
    for (const connector of connectors) {
      if (
        wallets.findIndex((wallet) => wallet.walletName === connector.id) !== -1
      ) {
        continue;
      }

      const minimalWallet: MinimalWallet = {
        walletName: connector.id,
        walletPrettyName:
          connector.id === "injected" ? "Browser Wallet" : connector.name,
        walletInfo: {
          logo: EVM_WALLET_LOGOS[connector.id],
        },
        connect: async () => {
          await connect({ connector });
        },
        disconnect: async () => {
          await disconnect();
        },
        isWalletConnected: connector.id === currentConnector?.id,
      };

      wallets.push(minimalWallet);
    }
  }

  return (
    <DialogContent>
      <WalletModal wallets={wallets} onClose={() => setIsOpen(false)} />
    </DialogContent>
  );
};

export default WalletModalWithContext;
