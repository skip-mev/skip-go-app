import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { ElementRef, useEffect, useRef } from "react";
import type {} from "typed-query-selector";

import { disclosure } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { useAccount } from "@/hooks/useAccount";
import { useChains as useSkipChains } from "@/hooks/useChains";

import { AdaptiveLink } from "../AdaptiveLink";
import AssetInput from "../AssetInput";
import { ConnectedWalletButton } from "../ConnectedWalletButton";
import { ContactDialog } from "../ContactDialog";
import { HistoryButton } from "../HistoryButton";
import { HistoryDialog } from "../HistoryDialog";
import { JsonDialog } from "../JsonDialog";
import RouteLoadingBanner from "../RouteLoadingBanner";
import RouteTransactionCountBanner from "../RouteTransactionCountBanner";
import { SettingsButton } from "../SettingsButton";
import { SettingsDialog } from "../SettingsDialog";
import { SimpleTooltip } from "../SimpleTooltip";
import TransactionDialog from "../TransactionDialog";
import { UsdDiff } from "../UsdValue";
import { useWalletModal, WalletModal } from "../WalletModal";
import { SwapDetails } from "./SwapDetails";
import { useSwapWidget } from "./useSwapWidget";

export function SwapWidget() {
  useEffect(() => void disclosure.rehydrate(), []);

  const { openWalletModal } = useWalletModal();

  const { data: chains } = useSkipChains();

  const {
    amountIn,
    amountOut,
    destinationAsset,
    destinationChain,
    direction,
    insufficientBalance,
    numberOfTransactions,
    onDestinationAssetChange,
    onDestinationChainChange,
    onSourceAssetChange,
    onSourceChainChange,
    priceImpactThresholdReached,
    route,
    routeError,
    routeLoading,
    routeWarningMessage,
    routeWarningTitle,
    setFormValues,
    sourceAsset,
    sourceChain,
    swapPriceImpactPercent,
  } = useSwapWidget();

  let usdDiffPercent = 0.0;
  if (route?.usdAmountIn && route?.usdAmountOut) {
    usdDiffPercent = (parseFloat(route.usdAmountOut) - parseFloat(route.usdAmountIn)) / parseFloat(route.usdAmountIn);
  }

  const srcAccount = useAccount("source");
  const destAccount = useAccount("destination");

  const isWalletConnected = srcAccount?.isWalletConnected && destAccount?.isWalletConnected;

  function promptDestAsset() {
    document.querySelector("[data-testid='destination'] button")?.click();
  }

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

  const accountStateKey = `${
    srcAccount?.isWalletConnected ? "src" : "no-src"
  }-${destAccount?.isWalletConnected ? "dest" : "no-dest"}`;

  return (
    <UsdDiff.Provider>
      <Tooltip.Provider
        delayDuration={0}
        disableHoverableContent
      >
        <div className="space-y-4">
          <div className="flex h-8 items-center">
            <p className="text-2xl font-semibold">From</p>
            <div className="flex-grow" />
            <HistoryButton />
            <SettingsButton />
            <div className="w-2" />
            {srcAccount?.address && srcAccount?.wallet ? (
              <SimpleTooltip label="Change Source Wallet">
                <ConnectedWalletButton
                  address={srcAccount.address}
                  onClick={() => sourceChain?.chainID && openWalletModal(sourceChain.chainID, "source")}
                  walletName={srcAccount.wallet?.walletPrettyName}
                  walletLogo={
                    srcAccount.wallet.walletInfo
                      ? typeof srcAccount.wallet.walletInfo.logo === "string"
                        ? srcAccount.wallet.walletInfo.logo
                        : srcAccount.wallet.walletInfo.logo?.major || srcAccount.wallet.walletInfo.logo?.minor
                      : ""
                  }
                  className="animate-slide-left-and-fade"
                  key={srcAccount.address}
                />
              </SimpleTooltip>
            ) : null}
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
              context="source"
              isLoading={direction === "swap-out" && routeLoading}
            />
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <button
                className={clsx(
                  "pointer-events-auto flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white",
                  "transition-transform enabled:hover:rotate-3 enabled:hover:scale-105",
                  "disabled:cursor-not-allowed disabled:bg-neutral-500 disabled:hover:scale-100",
                  "data-[swap=true]:pointer-events-none data-[swap=true]:animate-spin-swap",
                )}
                disabled={!destinationChain}
                onClick={() => {
                  if (!destinationChain || !invertButtonRef.current) return;
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
                <ArrowsUpDownIcon className="h-4 w-4" />
              </button>
            </div>
            <p className="text-2xl font-semibold">To</p>
            <div className="absolute inset-y-0 right-0 flex items-center">
              {destAccount?.address && destAccount?.wallet ? (
                <SimpleTooltip label="Change Destination Wallet">
                  <ConnectedWalletButton
                    address={destAccount.address}
                    onClick={() => {
                      destinationChain?.chainID && openWalletModal(destinationChain.chainID, "destination");
                    }}
                    walletName={destAccount.wallet?.walletPrettyName}
                    walletLogo={
                      destAccount.wallet.walletInfo
                        ? typeof destAccount.wallet.walletInfo.logo === "string"
                          ? destAccount.wallet.walletInfo.logo
                          : destAccount.wallet.walletInfo.logo?.major || destAccount.wallet.walletInfo.logo?.minor
                        : ""
                    }
                    className="animate-slide-left-and-fade"
                    key={destAccount.address}
                  />
                </SimpleTooltip>
              ) : null}
            </div>
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
              context="destination"
              isLoading={direction === "swap-in" && routeLoading}
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
          {route && !routeLoading && <RouteTransactionCountBanner numberOfTransactions={numberOfTransactions} />}
          {!!routeError && (
            <div className="flex w-full items-center rounded-md bg-red-50 p-3 text-left text-xs font-medium uppercase text-red-500">
              <p className="flex-1">{routeError}</p>
            </div>
          )}
          {destinationChain?.chainID === "dydx-mainnet-1" && (
            <div className="flex w-full items-center rounded-md bg-red-50 p-3 text-left text-xs font-medium uppercase text-red-500">
              <p className="flex-1 [&_a]:underline">
                This transaction will let you transfer and stake tokens on dydx, it will not allow you to trade. Follow
                the <AdaptiveLink href="https://dydx.exchange">dydx frontend</AdaptiveLink> directions to set up a
                trading account
              </p>
            </div>
          )}
          {!isWalletConnected && (
            <button
              className={clsx(
                "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white outline-none transition-[opacity,transform]",
                "disabled:cursor-not-allowed disabled:opacity-75",
                "enabled:hover:rotate-1 enabled:hover:scale-105",
              )}
              disabled={!sourceChain}
              onClick={async () => {
                if (sourceChain && !srcAccount?.isWalletConnected) {
                  openWalletModal(sourceChain.chainID, "source");
                  return;
                }
                if (!destinationChain) {
                  promptDestAsset();
                  return;
                }
                if (destinationChain && !destAccount?.isWalletConnected) {
                  openWalletModal(destinationChain.chainID, "destination");
                  return;
                }
              }}
            >
              <div
                key={accountStateKey}
                className="animate-slide-up-and-fade"
              >
                {!srcAccount?.isWalletConnected && !destAccount?.isWalletConnected && "Connect Wallet"}
                {!srcAccount?.isWalletConnected && destAccount?.isWalletConnected && "Connect Source Wallet"}
                {srcAccount?.isWalletConnected && !destAccount?.isWalletConnected && "Connect Destination Wallet"}
              </div>
            </button>
          )}
          {sourceChain && isWalletConnected && (
            <div className="space-y-4">
              <TransactionDialog
                isLoading={routeLoading}
                route={route}
                transactionCount={numberOfTransactions}
                insufficientBalance={insufficientBalance}
                shouldShowPriceImpactWarning={!!routeWarningTitle && !!routeWarningMessage}
                routeWarningTitle={routeWarningTitle}
                routeWarningMessage={routeWarningMessage}
              />
              {insufficientBalance && (
                <p className="animate-slide-up-and-fade text-center text-sm font-semibold text-red-500">
                  {typeof insufficientBalance === "string" ? (
                    <>Insufficient Balance: {insufficientBalance}</>
                  ) : (
                    <>Insufficient Balance</>
                  )}
                </p>
              )}
            </div>
          )}
        </div>
        <ContactDialog />
        <HistoryDialog />
        <SettingsDialog />
        <JsonDialog />
      </Tooltip.Provider>
      <WalletModal />
    </UsdDiff.Provider>
  );
}
