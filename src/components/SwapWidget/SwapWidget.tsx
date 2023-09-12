import { WalletStatus } from "@cosmos-kit/core";
import { useChain } from "@cosmos-kit/react";
import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import {
  ConnectButton,
  useChainModal,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import va from "@vercel/analytics";
import { is } from "immer/dist/internal";
import { FC, useMemo } from "react";
import { useAccount } from "wagmi";

import { useChains } from "@/context/chains";
import { getChainByID, isEVMChain } from "@/utils/utils";

import AssetInput from "../AssetInput";
import TransactionDialog from "../TransactionDialog";
import { useSwapWidget } from "./useSwapWidget";

const RouteLoading = () => (
  <div className="bg-black text-white/50 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
    <p className="flex-1">Finding best route...</p>
    <svg
      className="animate-spin h-4 w-4 inline-block text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

const RouteTransactionCountBanner: FC<{
  numberOfTransactions: number;
}> = ({ numberOfTransactions }) => (
  <div className="bg-black text-white/50 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
    <p className="flex-1">
      This route requires{" "}
      {numberOfTransactions === 1 && (
        <span className="text-white">1 Transaction</span>
      )}
      {numberOfTransactions > 1 && (
        <span className="text-white">{numberOfTransactions} Transactions</span>
      )}{" "}
      to complete
    </p>
  </div>
);

const ConnectWalletButtonCosmosKit: FC<{ chainID: string }> = ({ chainID }) => {
  const chain = getChainByID(chainID);
  const { connect } = useChain(chain.chain_name);
  return (
    <button
      className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform hover:scale-105 hover:rotate-1"
      onClick={async () => {
        await connect();

        va.track("wallet-connect", {
          chainID: chainID,
        });
      }}
    >
      Connect Wallet
    </button>
  );
};

const ConnectWalletButtonRainbowKit: FC = () => {
  const { openConnectModal } = useConnectModal();

  return (
    <button
      className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform hover:scale-105 hover:rotate-1"
      onClick={async () => {
        openConnectModal?.();
      }}
    >
      Connect Wallet
    </button>
  );
};

const ConnectWalletButton: FC<{ chainID: string }> = ({ chainID }) => {
  if (isEVMChain(chainID)) {
    return <ConnectWalletButtonRainbowKit />;
  }

  return <ConnectWalletButtonCosmosKit chainID={chainID} />;
};

export const SwapWidget: FC = () => {
  const { chains } = useChains();

  const {
    amountIn,
    amountOut,
    formValues,
    setFormValues,
    sourceAsset,
    sourceChain,
    destinationAsset,
    destinationChain,
    routeLoading,
    numberOfTransactions,
    route,
    insufficientBalance,
    onSourceChainChange,
    onSourceAssetChange,
    onDestinationChainChange,
    onDestinationAssetChange,
  } = useSwapWidget();

  const {
    status: walletConnectStatus,
    connect: connectWallet,
    chain,
  } = useChain(sourceChain?.record?.chain.chain_name ?? "cosmoshub");

  const { address, isConnected } = useAccount();

  const isWalletConnected = useMemo(() => {
    if (!sourceChain) {
      return false;
    }

    if (isEVMChain(sourceChain.chainID)) {
      return isConnected;
    }

    return walletConnectStatus === WalletStatus.Connected;
  }, [isConnected, sourceChain, walletConnectStatus]);

  return (
    <div className="bg-white shadow-xl rounded-3xl p-6 py-6 relative">
      <div className="space-y-6">
        <div>
          <p className="font-semibold text-2xl">From</p>
        </div>
        <div data-testid="source">
          <AssetInput
            amount={amountIn}
            onAmountChange={(amount) =>
              setFormValues({
                ...formValues,
                amountIn: amount,
              })
            }
            asset={sourceAsset}
            onAssetChange={onSourceAssetChange}
            chain={sourceChain}
            onChainChange={onSourceChainChange}
            showBalance
            chains={chains}
          />
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              className="bg-black text-white w-10 h-10 rounded-md flex items-center justify-center z-10 hover:scale-110 transition-transform"
              onClick={() => {
                setFormValues({
                  ...formValues,
                  sourceChain: destinationChain,
                  sourceAsset: destinationAsset,
                  destinationChain: sourceChain,
                  destinationAsset: sourceAsset,
                  amountIn: "",
                });
              }}
              data-testid="swap-button"
            >
              <ArrowsUpDownIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="font-semibold text-2xl">To</p>
        </div>
        <div data-testid="destination">
          <AssetInput
            amount={amountOut}
            asset={destinationAsset}
            onAssetChange={onDestinationAssetChange}
            chain={destinationChain}
            onChainChange={onDestinationChainChange}
            chains={chains}
          />
        </div>
        {routeLoading && <RouteLoading />}
        {route && !routeLoading && (
          <RouteTransactionCountBanner
            numberOfTransactions={numberOfTransactions}
          />
        )}
        {sourceChain && !isWalletConnected && (
          <ConnectWalletButton chainID={sourceChain.chainID} />
        )}
        {sourceChain && isWalletConnected && (
          <div className="space-y-4">
            <TransactionDialog
              route={route}
              transactionCount={numberOfTransactions}
              insufficientBalance={insufficientBalance}
            />
            {insufficientBalance && (
              <p className="text-center font-semibold text-sm text-red-500">
                Insufficient Balance
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
