import { useManager } from "@cosmos-kit/react";
import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { ElementRef, useEffect, useRef } from "react";
import type {} from "typed-query-selector";

import { disclosure } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { trackWallet } from "@/context/track-wallet";
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

  const { getWalletRepo } = useManager();

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

  const srcAccount = useAccount("source");
  const destAccount = useAccount("destination");

  const isWalletConnected =
    srcAccount?.isWalletConnected && destAccount?.isWalletConnected;

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
      <Tooltip.Provider delayDuration={0} disableHoverableContent>
        <div className="space-y-4">
          <div className="flex items-center h-8">
            <p className="font-semibold text-2xl">From</p>
            <div className="flex-grow" />
            <HistoryButton />
            <SettingsButton />
            <div className="w-2" />
            {srcAccount?.address && srcAccount?.wallet ? (
              <SimpleTooltip label="Change Source Wallet">
                <ConnectedWalletButton
                  address={srcAccount.address}
                  onClick={() =>
                    sourceChain?.chainID &&
                    openWalletModal(sourceChain.chainID, "source")
                  }
                  walletName={srcAccount.wallet?.walletPrettyName}
                  walletLogo={
                    srcAccount.wallet.walletInfo
                      ? typeof srcAccount.wallet.walletInfo.logo === "string"
                        ? srcAccount.wallet.walletInfo.logo
                        : srcAccount.wallet.walletInfo.logo?.major ||
                          srcAccount.wallet.walletInfo.logo?.minor
                      : ""
                  }
                  className="animate-slide-left-and-fade"
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
              context="src"
              isLoading={direction === "swap-out" && routeLoading}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <button
                className={clsx(
                  "bg-neutral-900 text-white w-8 h-8 rounded-md flex items-center justify-center pointer-events-auto",
                  "enabled:hover:scale-105 enabled:hover:rotate-3 transition-transform",
                  "disabled:hover:scale-100 disabled:bg-neutral-500 disabled:cursor-not-allowed",
                  "data-[swap=true]:animate-spin-swap data-[swap=true]:pointer-events-none",
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
                  if (destAccount?.wallet?.walletName) {
                    trackWallet.track(
                      "source",
                      destinationChain.chainID,
                      destAccount.wallet.walletName,
                    );
                  }
                  if (sourceChain?.chainID && srcAccount?.wallet?.walletName) {
                    trackWallet.track(
                      "destination",
                      sourceChain.chainID,
                      srcAccount?.wallet?.walletName,
                    );
                  }
                }}
                data-testid="swap-button"
                ref={invertButtonRef}
              >
                <ArrowsUpDownIcon className="w-4 h-4" />
              </button>
            </div>
            <p className="font-semibold text-2xl">To</p>
            <div className="absolute inset-y-0 right-0 flex items-center">
              {destAccount?.address && destAccount?.wallet ? (
                <SimpleTooltip label="Change Destination Wallet">
                  <ConnectedWalletButton
                    address={destAccount.address}
                    onClick={() => {
                      destinationChain?.chainID &&
                        openWalletModal(
                          destinationChain.chainID,
                          "destination",
                        );
                    }}
                    walletName={destAccount.wallet?.walletPrettyName}
                    walletLogo={
                      destAccount.wallet.walletInfo
                        ? typeof destAccount.wallet.walletInfo.logo === "string"
                          ? destAccount.wallet.walletInfo.logo
                          : destAccount.wallet.walletInfo.logo?.major ||
                            destAccount.wallet.walletInfo.logo?.minor
                        : ""
                    }
                    className="animate-slide-left-and-fade"
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
              showBalance
              context="dest"
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
          {route && !routeLoading && (
            <RouteTransactionCountBanner
              numberOfTransactions={numberOfTransactions}
            />
          )}
          {!!routeError && (
            <div className="bg-red-50 text-red-500 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
              <p className="flex-1">{routeError}</p>
            </div>
          )}
          {destinationChain?.chainID === "dydx-mainnet-1" && (
            <div className="bg-red-50 text-red-500 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
              <p className="flex-1 [&_a]:underline">
                This transaction will let you transfer and stake tokens on dydx,
                it will not allow you to trade. Follow the{" "}
                <AdaptiveLink href="https://dydx.exchange">
                  dydx frontend
                </AdaptiveLink>{" "}
                directions to set up a trading account
              </p>
            </div>
          )}
          {!isWalletConnected && (
            <button
              className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform hover:scale-105 hover:rotate-1"
              onClick={async () => {
                if (sourceChain && !srcAccount?.isWalletConnected) {
                  openWalletModal(sourceChain.chainID, "source");
                  return;
                }
                if (!destinationChain) {
                  promptDestAsset();
                  return;
                }
                if (
                  sourceChain?.chainType === "cosmos" &&
                  destinationChain.chainType === "cosmos" &&
                  srcAccount?.isWalletConnected &&
                  !destAccount?.isWalletConnected
                ) {
                  const { wallets } = getWalletRepo(destinationChain.chainName);
                  const wallet = wallets.find(
                    (item) => item.walletName === srcAccount.wallet?.walletName,
                  );
                  if (!wallet) {
                    openWalletModal(destinationChain.chainID, "destination");
                    return;
                  }
                  await wallet.client.addChain?.({
                    chain: {
                      bech32_prefix: wallet.chain.bech32_prefix,
                      chain_id: wallet.chain.chain_id,
                      chain_name: wallet.chain.chain_name,
                      network_type: wallet.chain.network_type,
                      pretty_name: wallet.chain.pretty_name,
                      slip44: wallet.chain.slip44,
                      status: wallet.chain.status,
                      apis: wallet.chain.apis,
                      bech32_config: wallet.chain.bech32_config,
                      explorers: wallet.chain.explorers,
                      extra_codecs: wallet.chain.extra_codecs,
                      fees: wallet.chain.fees,
                      peers: wallet.chain.peers,
                    },
                    name: wallet.chainName,
                    assetList: wallet.assetList,
                  });
                  await wallet.connect();
                  trackWallet.track(
                    "destination",
                    destinationChain.chainID,
                    wallet.walletName,
                  );
                  return;
                }
                if (destinationChain && !destAccount?.isWalletConnected) {
                  openWalletModal(destinationChain.chainID, "destination");
                  return;
                }
              }}
            >
              <div key={accountStateKey} className="animate-slide-up-and-fade">
                {!srcAccount?.isWalletConnected &&
                  !destAccount?.isWalletConnected &&
                  "Connect Wallet"}
                {!srcAccount?.isWalletConnected &&
                  destAccount?.isWalletConnected &&
                  "Connect Source Wallet"}
                {srcAccount?.isWalletConnected &&
                  !destAccount?.isWalletConnected &&
                  "Connect Destination Wallet"}
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
        <ContactDialog />
        <HistoryDialog />
        <SettingsDialog />
        <JsonDialog />
      </Tooltip.Provider>
      <WalletModal />
    </UsdDiff.Provider>
  );
}
