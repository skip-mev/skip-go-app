import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import { FC, Fragment } from "react";

import { useChains as useSkipChains } from "@/api/queries";
import { useAccount } from "@/hooks/useAccount";

import AssetInput from "../AssetInput";
import { ConnectedWalletButton } from "../ConnectedWalletButton";
import { ConnectWalletButtonSmall } from "../ConnectWalletButtonSmall";
import { HistoryButton } from "../HistoryButton";
import { HistoryDialog } from "../HistoryDialog";
import { JsonDialog } from "../JsonDialog";
import RouteLoadingBanner from "../RouteLoadingBanner";
import RouteTransactionCountBanner from "../RouteTransactionCountBanner";
import TransactionDialog from "../TransactionDialog";
import { useWalletModal, WalletModal } from "../WalletModal";
import { useSwapWidget } from "./useSwapWidget";

export const SwapWidget: FC = () => {
  const { openWalletModal } = useWalletModal();

  const { chains } = useSkipChains();

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
    noRouteFound,
  } = useSwapWidget();

  const { address, isWalletConnected, wallet } = useAccount(
    sourceChain?.chainID ?? "cosmoshub-4",
  );

  const { address: destinationChainAddress } = useAccount(
    destinationChain?.chainID ?? "cosmoshub-4",
  );

  const shouldShowDestinationWalletButton =
    !!sourceChain &&
    !!destinationChain &&
    sourceChain.chainType !== destinationChain.chainType;

  return (
    <Fragment>
      <div>
        <div className="space-y-6">
          <div className="flex items-center">
            <p className="font-semibold text-2xl">From</p>
            <div className="flex-grow" />
            <HistoryButton />
            {address && wallet && isWalletConnected ? (
              <ConnectedWalletButton
                address={address}
                onClick={() => openWalletModal(sourceChain?.chainID ?? "")}
                walletName={wallet.walletPrettyName}
                walletLogo={
                  wallet.walletInfo.logo
                    ? typeof wallet.walletInfo.logo === "string"
                      ? wallet.walletInfo.logo
                      : wallet.walletInfo.logo.major
                    : ""
                }
              />
            ) : (
              <ConnectWalletButtonSmall
                onClick={() => openWalletModal(sourceChain?.chainID ?? "")}
              />
            )}
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
              chains={chains ?? []}
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
            {shouldShowDestinationWalletButton ? (
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  className="bg-[#FF486E]/20 hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 flex items-center gap-1 transition-colors focus:outline-none"
                  onClick={() =>
                    openWalletModal(destinationChain?.chainID ?? "cosmoshub-4")
                  }
                  data-testid="destination-wallet-btn"
                >
                  {destinationChainAddress
                    ? `${destinationChainAddress.slice(
                        0,
                        8,
                      )}...${destinationChainAddress.slice(-5)}`
                    : "Connect Wallet"}
                </button>
              </div>
            ) : null}
          </div>
          <div data-testid="destination">
            <AssetInput
              amount={amountOut}
              asset={destinationAsset}
              onAssetChange={onDestinationAssetChange}
              chain={destinationChain}
              onChainChange={onDestinationChainChange}
              chains={chains ?? []}
            />
          </div>
          {routeLoading && <RouteLoadingBanner />}
          {route && !routeLoading && (
            <RouteTransactionCountBanner
              numberOfTransactions={numberOfTransactions}
            />
          )}
          {noRouteFound && (
            <div className="bg-red-50 text-red-500 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
              <p className="flex-1">No route found</p>
            </div>
          )}
          {destinationChain?.chainID === "dydx-mainnet-1" ? (
            <div className="bg-red-50 text-red-500 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
              <p className="flex-1">
                This transaction will let you transfer and stake tokens on dydx,
                it will not allow you to trade. Follow the{" "}
                <a
                  href="https://dydx.exchange/"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  dydx frontend
                </a>{" "}
                directions to set up a trading account
              </p>
            </div>
          ) : null}
          {sourceChain && !isWalletConnected && (
            <button
              className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform hover:scale-105 hover:rotate-1"
              onClick={() => {
                openWalletModal(sourceChain.chainID);
              }}
            >
              Connect Wallet
            </button>
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
        <HistoryDialog />
        <JsonDialog />
      </div>
      <WalletModal />
    </Fragment>
  );
};
