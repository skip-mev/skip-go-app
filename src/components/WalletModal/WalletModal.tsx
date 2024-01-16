import { useManager } from "@cosmos-kit/react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/16/solid";
import { ArrowLeftIcon, FaceFrownIcon } from "@heroicons/react/20/solid";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
import { useMemo } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

import { chainIdToName } from "@/chains/types";
import { DialogContent } from "@/components/Dialog";
import { EVM_WALLET_LOGOS, INJECTED_EVM_WALLET_LOGOS } from "@/constants/wagmi";
import { trackWallet } from "@/context/track-wallet";
import { useChainByID } from "@/hooks/useChains";

import { AdaptiveLink } from "../AdaptiveLink";
import { useWalletModal } from "./context";
import { useTotalWallets, WalletListItem } from "./WalletListItem";

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
  chainType: string;
  wallets: MinimalWallet[];
  onClose: () => void;
}

export function WalletModal({ chainType, onClose, wallets }: Props) {
  const { context } = useWalletModal();

  async function onWalletConnect(wallet: MinimalWallet) {
    await wallet.connect();
    onClose();
  }

  const totalWallets = useTotalWallets();

  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-2">
      <div className="relative">
        <button
          className={clsx(
            "hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            "absolute left-0 inset-y-0",
          )}
          onClick={onClose}
        >
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <p className="font-bold text-xl text-center">
          Connect {context && <span className="capitalize">{context}</span>}{" "}
          Wallet
        </p>
      </div>
      {totalWallets < 1 && (
        <div className="flex flex-col items-center py-16 space-y-4 text-center">
          <FaceFrownIcon className="w-16 h-16 text-gray-500" />
          <h4 className="text-center font-medium">No Wallets Available</h4>
          <p className="text-sm lg:px-8 text-neutral-600">
            Please install or enable your preferred wallet extension.
            <br />
            <AdaptiveLink
              href={
                chainType === "cosmos"
                  ? "https://cosmos.network/wallets"
                  : "https://ethereum.org/en/wallets/find-wallet"
              }
              className="text-red-500 hover:underline inline-flex items-center gap-1"
            >
              <span>Explore available wallets</span>
              <ArrowTopRightOnSquareIcon className="w-3 h-3" />
            </AdaptiveLink>
          </p>
        </div>
      )}
      <ScrollArea.Root
        className={clsx(
          "overflow-hidden relative flex-grow isolate",
          "before:absolute before:bottom-0 before:inset-x-0 before:h-2 before:z-10",
          "before:bg-gradient-to-t before:from-white before:to-transparent",
        )}
      >
        <ScrollArea.Viewport className="w-full h-full py-4">
          {wallets.map((wallet) => (
            <WalletListItem
              key={wallet.walletName}
              chainType={chainType}
              walletName={wallet.walletName}
              className={clsx(
                "mb-2 group relative data-[unsupported=true]:opacity-30",
                "data-[unsupported=true]:before:absolute data-[unsupported=true]:before:inset-0 data-[unsupported=true]:before:cursor-not-allowed",
              )}
            >
              <button
                className="flex items-center gap-2 w-full p-2 rounded-lg transition-colors group-hover:bg-[#FF486E]/20 focus:-outline-offset-2"
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
                    ? "Metamask (Leap Snap)"
                    : wallet.walletPrettyName}
                </p>
              </button>
              {wallet.isWalletConnected && (
                <button
                  aria-label={`Disconnect ${wallet.walletPrettyName}`}
                  className="bg-[#FF486E]/20 group-hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 flex items-center gap-1 transition-colors focus:outline-none absolute right-4 top-1/2 -translate-y-1/2"
                  onClick={async (event) => {
                    event.stopPropagation();
                    await wallet.disconnect();
                    onClose();
                  }}
                >
                  Disconnect
                </button>
              )}
            </WalletListItem>
          ))}
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="z-20 flex select-none touch-none py-4 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="transition-colors flex-1 bg-neutral-500/50 hover:bg-neutral-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-2 before:h-2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
    </div>
  );
}

function WalletModalWithContext() {
  const { connector: currentConnector } = useAccount();
  const { chainID, context } = useWalletModal();
  const { disconnect } = useDisconnect();
  const { connectors, connect } = useConnect();
  const { getWalletRepo } = useManager();

  const { setIsOpen } = useWalletModal();

  const { data: chain } = useChainByID(chainID);

  if (!chain) {
    return null;
  }

  const { chainType } = chain;

  let wallets: MinimalWallet[] = [];

  if (chainType === "cosmos") {
    const chainName = chainIdToName[chainID];
    const walletRepo = getWalletRepo(chainName);
    wallets = walletRepo.wallets.map((w) => ({
      walletName: w.walletName,
      walletPrettyName: w.walletPrettyName,
      walletInfo: {
        logo: w.walletInfo.logo,
      },
      connect: async () => {
        await w.client.addChain?.({
          chain: {
            bech32_prefix: w.chain.bech32_prefix,
            chain_id: w.chain.chain_id,
            chain_name: w.chain.chain_name,
            network_type: w.chain.network_type,
            pretty_name: w.chain.pretty_name,
            slip44: w.chain.slip44,
            status: w.chain.status,
            apis: w.chain.apis,
            bech32_config: w.chain.bech32_config,
            explorers: w.chain.explorers,
            extra_codecs: w.chain.extra_codecs,
            fees: w.chain.fees,
            peers: w.chain.peers,
          },
          name: w.chainName,
          assetList: w.assetList,
        });
        await w.connect();
        context && trackWallet.track(context, chainID, w.walletName);
      },
      disconnect: async () => {
        await w.disconnect();
        context && trackWallet.untrack(context);
      },
      isWalletConnected: w.isWalletConnected,
    }));
  }

  if (chainType === "evm") {
    for (const connector of connectors) {
      if (
        wallets.findIndex((wallet) => wallet.walletName === connector.id) !== -1
      ) {
        continue;
      }

      const logoUrl =
        INJECTED_EVM_WALLET_LOGOS[connector.name] ||
        EVM_WALLET_LOGOS[connector.id] ||
        EVM_WALLET_LOGOS.injected;

      const minimalWallet: MinimalWallet = {
        walletName: connector.id,
        walletPrettyName: connector.name,
        walletInfo: {
          logo: logoUrl,
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
      <WalletModal
        chainType={chainType}
        wallets={wallets}
        onClose={() => setIsOpen(false)}
      />
    </DialogContent>
  );
}

export default WalletModalWithContext;
