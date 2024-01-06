import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { FC, useEffect } from "react";
import type {} from "typed-query-selector";

import { useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { useAccount } from "@/hooks/useAccount";
import { useChains as useSkipChains } from "@/hooks/useChains";

import AssetInput from "../AssetInput";
import { ConnectedWalletButton } from "../ConnectedWalletButton";
import { ConnectWalletButtonSmall } from "../ConnectWalletButtonSmall";
import { HistoryButton } from "../HistoryButton";
import { HistoryDialog } from "../HistoryDialog";
import { JsonDialog } from "../JsonDialog";
import RouteLoadingBanner from "../RouteLoadingBanner";
import RouteTransactionCountBanner from "../RouteTransactionCountBanner";
import { SettingsButton } from "../SettingsButton";
import { SettingsDialog } from "../SettingsDialog";
import TransactionDialog from "../TransactionDialog";
import { UsdDiff } from "../UsdValue";
import { useWalletModal, WalletModal } from "../WalletModal";
import { SwapDetails } from "./SwapDetails";
import { useSwapWidget } from "./useSwapWidget";

export const SwapWidget: FC = () => {
  const { openWalletModal } = useWalletModal();

  const { data: chains } = useSkipChains();

  const {
    amountIn,
    amountOut,
    direction,
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
    swapPriceImpactPercent,
    priceImpactThresholdReached,
    routeError,
    routeWarningTitle,
    routeWarningMessage,
  } = useSwapWidget();

  let usdDiffPercent = 0.0;
  if (route?.usdAmountIn && route?.usdAmountOut) {
    usdDiffPercent =
      (parseFloat(route.usdAmountOut) - parseFloat(route.usdAmountIn)) /
      parseFloat(route.usdAmountIn);
  }

  const {
    address,
    isWalletConnected: isSourceWalletConnected,
    wallet,
  } = useAccount(sourceChain?.chainID ?? "cosmoshub-4");

  const {
    address: destinationChainAddress,
    isWalletConnected: isDestinationWalletConnected,
  } = useAccount(destinationChain?.chainID ?? "cosmoshub-4");

  const isWalletConnected =
    isSourceWalletConnected && isDestinationWalletConnected;

  const shouldShowDestinationWalletButton =
    !!sourceChain &&
    !!destinationChain &&
    sourceChain.chainType !== destinationChain.chainType;

  const [isSwapDetailsOpen] = useDisclosureKey("swapDetailsCollapsible");

  useEffect(() => {
    document.querySelector("[data-testid='source'] input")?.focus();
    return useSettingsStore.subscribe((state) => {
      if (+state.slippage < 0 || +state.slippage > 100) {
        useSettingsStore.setState({
          slippage: Math.max(0, Math.min(100, +state.slippage)).toString(),
        });
      }
    });
  }, []);

  const invertButtonRef = useRef<ElementRef<"button">>(null);
  useEffect(() => {
    const ref = invertButtonRef.current;
    if (!ref) return;
    const listener = () => ref.setAttribute("data-swap", "false");
    ref.addEventListener("animationend", listener);
    return () => ref.removeEventListener("animationend", listener);
  }, []);

  return (
    <UsdDiff.Provider>
      <Tooltip.Provider>
        <div className="space-y-4">
          <div className="flex items-center h-8">
            <p className="font-semibold text-2xl">From</p>
            <div className="flex-grow" />
            <HistoryButton />
            <SettingsButton />
            <div className="w-2" />
            {address && wallet && isSourceWalletConnected ? (
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
              amountUSD={route?.usdAmountIn}
              asset={sourceAsset}
              chain={sourceChain}
              chains={chains ?? []}
              onAmountChange={(amount) => {
                setFormValues({ amountIn: amount, direction: "swap-in" });
              }}
              onAssetChange={onSourceAssetChange}
              onChainChange={onSourceChainChange}
              showBalance
              context="src"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                className={clsx(
                  "bg-black text-white w-10 h-10 rounded-md flex items-center justify-center z-10 hover:scale-105 hover:rotate-3 transition-transform",
                  "disabled:hover:scale-100 disabled:bg-gray-700 disabled:cursor-not-allowed",
                  "data-[swap=true]:animate-spin-swap data-[swap=true]:pointer-events-none",
                )}
                disabled={!destinationChain || !destinationAsset}
                onClick={() => {
                  if (
                    !destinationChain ||
                    !destinationAsset ||
                    !invertButtonRef.current
                  )
                    return;
                  invertButtonRef.current.setAttribute("data-swap", "true");
                  setFormValues({
                    sourceChain: destinationChain,
                    sourceAsset: destinationAsset,
                    destinationChain: sourceChain,
                    destinationAsset: sourceAsset,
                    amountIn: amountOut,
                    amountOut: amountIn,
                    direction: direction === "swap-in" ? "swap-out" : "swap-in",
                  });
                }}
                data-testid="swap-button"
                ref={invertButtonRef}
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
              amountUSD={route?.usdAmountOut}
              diffPercentage={usdDiffPercent}
              asset={destinationAsset}
              chain={destinationChain}
              chains={chains ?? []}
              onAmountChange={(amount) => {
                setFormValues({ amountOut: amount, direction: "swap-out" });
              }}
              onAssetChange={onDestinationAssetChange}
              onChainChange={onDestinationChainChange}
              showSlippage={!isSwapDetailsOpen}
              context="dest"
            />
          </div>
          {route && (
            <SwapDetails
              direction={direction}
              amountIn={amountIn}
              amountOut={amountOut}
              sourceChain={sourceChain}
              sourceAsset={sourceAsset}
              destinationChain={destinationChain}
              destinationAsset={destinationAsset}
              route={route}
              priceImpactPercent={swapPriceImpactPercent ?? 0}
              priceImpactThresholdReached={priceImpactThresholdReached}
            />
          )}
          {routeLoading && <RouteLoadingBanner />}
          {route && !routeLoading && (
            <RouteTransactionCountBanner
              numberOfTransactions={numberOfTransactions}
            />
          )}
          {routeError !== "" && (
            <div className="bg-red-50 text-red-500 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
              <p className="flex-1">{routeError}</p>
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
                if (!isSourceWalletConnected) {
                  openWalletModal(sourceChain.chainID);
                  return;
                }

                if (destinationChain && !isDestinationWalletConnected) {
                  openWalletModal(destinationChain.chainID);
                  return;
                }
              }}
            >
              Connect Wallet
            </button>
          )}
          {sourceChain && isWalletConnected && (
            <div className="space-y-4">
              <TransactionDialog
                isLoading={routeLoading}
                route={route}
                transactionCount={numberOfTransactions}
                insufficientBalance={insufficientBalance}
                shouldShowPriceImpactWarning={
                  !!routeWarningTitle && !!routeWarningMessage
                }
                routeWarningTitle={routeWarningTitle}
                routeWarningMessage={routeWarningMessage}
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
        <SettingsDialog />
        <JsonDialog />
      </Tooltip.Provider>
      <WalletModal />
    </UsdDiff.Provider>
  );
};
