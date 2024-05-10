import { ArrowLeftIcon, CheckCircleIcon, FingerPrintIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import * as Sentry from "@sentry/react";
import { RouteResponse } from "@skip-router/core";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useAssets } from "@/context/assets";
import { chainAddresses, useChainAddressesStore } from "@/context/chainAddresses";
import { useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { trackWallet, TrackWalletCtx } from "@/context/track-wallet";
import { txHistory } from "@/context/tx-history";
import { useChains } from "@/hooks/useChains";
import { useFinalityTimeEstimate } from "@/hooks/useFinalityTimeEstimate";
import { useMakeWallets } from "@/hooks/useMakeWallets";
import { useBroadcastedTxsStatus, useSkipClient } from "@/solve";
import { isUserRejectedRequestError } from "@/utils/error";
import { getExplorerUrl } from "@/utils/explorer";
import { randomId } from "@/utils/random";
import { cn } from "@/utils/ui";

import * as AlertCollapse from "./AlertCollapse";
import { ChainStep } from "./ChainStep";
import { makeActions } from "./make-actions";
import { makeChainIDsWithAction } from "./make-chain-ids-with-actions";
export interface BroadcastedTx {
  chainID: string;
  txHash: string;
  explorerLink: string;
}

export const PreviewRoute = ({
  route,
  disclosure,
  isAmountError,
}: {
  route: RouteResponse;
  disclosure: ReturnType<typeof useDisclosureKey>;
  isAmountError?: boolean | string;
}) => {
  const skipClient = useSkipClient();
  const { getAsset } = useAssets();
  const { data: chains } = useChains();
  const getChain = (chainID: string) => chains?.find((chain) => chain.chainID === chainID);
  const { makeWallets } = useMakeWallets();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, control] = disclosure;
  const [indexSetAddressDialogOpen, setIndexIsSetAddressDialogOpen] = useState<number>();

  const actions = makeActions({ route });
  const chainIDsWithAction = makeChainIDsWithAction({ route, actions });

  const chainAddressesStore = useChainAddressesStore((state) => state);
  const enabledSetAddressIndex = useMemo(() => {
    const values = Object.values(chainAddressesStore);
    if (values.length === 0) return;
    if (!values[values.length - 1]?.address) {
      return values.length - 1;
    }
    return values.findIndex((v) => !v?.address);
  }, [chainAddressesStore]);

  const allAddressFilled = route.chainIDs
    .map((chainID, index) => {
      const chainAddress = chainAddresses.get(index);

      return (Boolean(chainAddress?.address) && chainAddress?.chainID === chainID) === true;
    })
    .every((v) => v);

  const [broadcastedTxs, setBroadcastedTxs] = useState<BroadcastedTx[]>([]);
  const { data: statusData } = useBroadcastedTxsStatus({
    txs: broadcastedTxs,
    txsRequired: route.txsRequired,
  });

  const [_showLedgerWarning, setShowLedgerWarning] = useState({
    cctp: false,
    ethermint: false,
  });
  const showLedgerWarning = _showLedgerWarning.cctp || _showLedgerWarning.ethermint;
  const estimatedFinalityTime = useFinalityTimeEstimate(route);

  async function onSubmit() {
    if (!allAddressFilled) throw new Error("All addresses must be filled");
    const historyId = randomId();

    const userAddresses: Record<string, string> = {};
    route.chainIDs.forEach((chainID, index) => {
      const chainAddress = chainAddresses.get(index);
      if (chainID === chainAddress?.chainID && chainAddress?.address) {
        userAddresses[chainID] = chainAddress?.address;
      }
    });

    const isAddressError = route.chainIDs.some((chainID) => !userAddresses[chainID]);

    if (isAddressError) {
      throw new Error("All addresses must be filled");
    }

    try {
      await skipClient.executeRoute({
        route,
        userAddresses,
        validateGasBalance: route.txsRequired === 1,
        slippageTolerancePercent: useSettingsStore.getState().slippage,
        onTransactionTracked: async (txStatus) => {
          const makeExplorerUrl = await getExplorerUrl(txStatus.chainID);
          const explorerLink = makeExplorerUrl?.(txStatus.txHash);

          txHistory.addStatus(historyId, route, {
            chainId: txStatus.chainID,
            txHash: txStatus.txHash,
            explorerLink: explorerLink || "#",
          });

          setBroadcastedTxs((v) => {
            const txs = [
              ...v,
              {
                chainID: txStatus.chainID,
                txHash: txStatus.txHash,
                explorerLink: explorerLink || "#",
              },
            ];
            if (route.txsRequired === txs.length) {
              toast.success(<p>You can safely navigate away from this page while your transaction is pending</p>, {
                icon: <InformationCircleIcon className="h-10 w-10 text-blue-500" />,
              });
            }
            return txs;
          });
        },
      });
    } catch (err: unknown) {
      console.error(err);
      if (isUserRejectedRequestError(err)) {
        throw new Error("User rejected request");
      }
      Sentry.withScope((scope) => {
        scope.setUser({
          id: chainAddresses.get(0)?.address,
        });
        scope.setTransactionName("Swap.onSubmit");
        scope.setTags({
          sourceChain: route.sourceAssetChainID,
          destinationChain: route.destAssetChainID,
          sourceAssetDenom: route.sourceAssetDenom,
          destinationAssetDenom: route.destAssetDenom,
          doesSwap: route.doesSwap,
        });
        scope.setExtras({
          sourceAddress: chainAddresses.get(0)?.address,
          destinationAddress: chainAddresses.get(route.chainIDs.length - 1)?.address,
          sourceChain: route.sourceAssetChainID,
          destinationChain: route.destAssetChainID,
          userAddresses,
          sourceAssetDenom: route.sourceAssetDenom,
          destinationAssetDenom: route.destAssetDenom,
          amountIn: route.amountIn,
          amountOut: route.amountOut,
        });
        Sentry.captureException(err);
      });
      throw err;
    }
  }

  const submitMutation = useMutation({
    gcTime: Infinity,
    mutationFn: onSubmit,
    onMutate: () => {
      setIsExpanded(true);
    },
    onError: (err: unknown) => {
      console.error(err);
      toast(
        ({ createdAt, id }) => (
          <div className="flex flex-col">
            <h4 className="mb-2 font-bold">Transaction Failed!</h4>
            <pre className="mb-4 overflow-auto whitespace-pre-wrap break-all rounded border p-2 font-mono text-xs">
              {err instanceof Error ? `${err.name}: ${err.message}` : String(err)}
              <br />
              <br />
              {new Date(createdAt).toISOString()}
            </pre>
            <button
              className="self-end text-sm font-medium text-red-500 hover:underline"
              onClick={() => toast.dismiss(id)}
            >
              Clear Notification &times;
            </button>
          </div>
        ),
        {
          ariaProps: {
            "aria-live": "assertive",
            role: "alert",
          },
          duration: Infinity,
        },
      );
    },
  });

  const SubmitButton = () => {
    if (allAddressFilled) {
      return (
        <button
          className={cn(
            "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
            "outline-none transition-transform",
            "enabled:hover:rotate-1 enabled:hover:scale-105",
            "disabled:cursor-not-allowed disabled:opacity-75",
          )}
          onClick={() => submitMutation.mutate()}
          disabled={submitMutation.isPending || !!isAmountError || showLedgerWarning || !allAddressFilled}
        >
          Submit
        </button>
      );
    }

    const isSignRequired =
      enabledSetAddressIndex &&
      chainIDsWithAction[enabledSetAddressIndex]?.transferAction?.signRequired &&
      enabledSetAddressIndex !== 0 &&
      chainIDsWithAction[enabledSetAddressIndex].transferAction?.id !==
        chainIDsWithAction[enabledSetAddressIndex - 1].transferAction?.id;

    return (
      <button
        className={cn(
          "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
          "outline-none transition-transform",
          "enabled:hover:rotate-1 enabled:hover:scale-105",
          "disabled:cursor-not-allowed disabled:opacity-75",
        )}
        onClick={async () => {
          if (isSignRequired) {
            try {
              const { cosmos, evm, svm } = trackWallet.get();
              const chain = getChain(chainIDsWithAction[enabledSetAddressIndex].chainID);
              if (!chain) {
                throw new Error("Chain not found!");
              }
              const trackedWallet =
                chain.chainType === "cosmos"
                  ? cosmos
                  : chain.chainType === "evm"
                    ? evm
                    : chain.chainType === "svm"
                      ? svm
                      : undefined;

              const wallets = makeWallets(chain?.chainID);
              if (trackedWallet) {
                const wallet = wallets.find((w) => w.walletName === trackedWallet.walletName);
                if (!wallet) {
                  throw new Error("Wallet not found!");
                }
                const address = await wallet.getAddress?.({ signRequired: true });
                if (!address) {
                  throw new Error("Address not found!");
                }
                chainAddresses.set({
                  index: enabledSetAddressIndex,
                  chainID: chain.chainID,
                  chainType: chain.chainType as TrackWalletCtx,
                  address,
                  source: wallet,
                });
              }
            } catch (error) {
              setIndexIsSetAddressDialogOpen(enabledSetAddressIndex);
            }
          } else {
            setIndexIsSetAddressDialogOpen(enabledSetAddressIndex);
          }
          setIsExpanded(true);
        }}
      >
        {enabledSetAddressIndex === Object.values(chainAddressesStore).length - 1 || !isSignRequired
          ? "Set Destination Address"
          : isSignRequired
            ? "Connect Wallet"
            : "Set Recovery Address"}
      </button>
    );
  };

  return (
    <div className="absolute inset-0 animate-fade-zoom-in rounded-3xl bg-white">
      <div className="flex h-full flex-col space-y-6 overflow-y-auto p-6 scrollbar-hide">
        <div>
          <div className="flex items-center justify-between pr-1">
            <div className="flex items-center gap-4">
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
                onClick={control.close}
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <p className="text-xl font-bold">Transaction Preview</p>
            </div>
            {isExpanded && (
              <button
                className="right-7 text-xs font-medium text-[#FF486E]"
                onClick={() => setIsExpanded(false)}
              >
                Hide Details
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-neutral-200 p-4">
          {chainIDsWithAction.map(({ chainID, transferAction, swapAction }, index) => (
            <ChainStep
              route={route}
              key={`${index}-${chainID}`}
              transferAction={transferAction}
              swapAction={swapAction}
              chainID={chainID}
              index={index}
              chainIDsWithAction={chainIDsWithAction}
              broadcastedTxs={broadcastedTxs}
              mutationStatus={{
                isError: submitMutation.isError,
                isSuccess: submitMutation.isSuccess,
                isPending: submitMutation.isPending,
              }}
              setShowLedgerWarning={setShowLedgerWarning}
              setIsAddressDialogOpen={(v) => setIndexIsSetAddressDialogOpen(v)}
              isSetAddressDialogOpen={indexSetAddressDialogOpen === index}
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              isOpen={isOpen}
            />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {statusData?.isSuccess && submitMutation.isSuccess && (
            <div className="flex flex-row items-center space-x-2 font-semibold">
              <CheckCircleIcon className="h-8 w-8 text-green-500" />
              <p>
                {route.doesSwap &&
                  `Successfully swapped ${
                    getAsset(route.sourceAssetDenom, route.sourceAssetChainID)?.recommendedSymbol ??
                    route.sourceAssetDenom
                  } for ${getAsset(route.destAssetDenom, route.destAssetChainID)?.recommendedSymbol ?? route.destAssetDenom}`}
                {!route.doesSwap &&
                  `Successfully transfered ${
                    getAsset(route.sourceAssetDenom, route.sourceAssetChainID)?.recommendedSymbol ??
                    route.sourceAssetDenom
                  } from ${chains?.find((c) => c.chainID === route.sourceAssetChainID)?.prettyName} to ${chains?.find((c) => c.chainID === route.destAssetChainID)?.prettyName}`}
              </p>
            </div>
          )}

          {estimatedFinalityTime !== "" && (
            <AlertCollapse.Root type="info">
              <AlertCollapse.Trigger>EVM bridging finality time is {estimatedFinalityTime}</AlertCollapse.Trigger>
              <AlertCollapse.Content>
                <p>
                  This swap contains at least one EVM chain, so it might take longer. Read more about{" "}
                  <a
                    href={HREF_COMMON_FINALITY_TIMES}
                    className="underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    common finality times
                  </a>
                  .
                </p>
              </AlertCollapse.Content>
            </AlertCollapse.Root>
          )}
          {_showLedgerWarning.cctp && (
            <AlertCollapse.Root
              type="warning"
              initialOpen={true}
            >
              <AlertCollapse.Content>
                <p>
                  <b>WARNING: </b>
                  ibc.fun does not support signing with Ledger when transferring over CCTP to the Ethereum ecosystem.
                  We&apos;re actively working on fixing this with the Noble/Circle teams. We apologize for the
                  inconvenience
                </p>
              </AlertCollapse.Content>
            </AlertCollapse.Root>
          )}
          {_showLedgerWarning.ethermint && (
            <AlertCollapse.Root
              type="warning"
              initialOpen={true}
            >
              <AlertCollapse.Content>
                <p>
                  <b>WARNING: </b>
                  ibc.fun does not support signing with Ledger on Ethermint-like chains (e.g. Injective, Dymension,
                  EVMOS, etc...). We&apos;re actively working on fixing this with the Ledger team. We apologize for the
                  inconvenience.
                </p>
              </AlertCollapse.Content>
            </AlertCollapse.Root>
          )}
          {isAmountError && !submitMutation.isPending && !submitMutation.isSuccess && (
            <p className="text-balance text-center text-sm font-medium text-red-500">
              {typeof isAmountError === "string" ? isAmountError : "Insufficient balance."}
            </p>
          )}
        </div>
        <div className="space-y-4">
          {!submitMutation.isError && !submitMutation.isSuccess && (
            <div className="flex w-full items-center justify-center space-x-2 text-sm font-medium">
              {route.txsRequired === broadcastedTxs.length ? (
                <>
                  <CheckCircleIcon className="h-8 w-8 text-green-500" />
                  <p className="text-sm font-semibold">
                    Your transaction is being processed. You can safely navigate away from this page.
                  </p>
                </>
              ) : route.txsRequired > 1 ? (
                <>
                  <div className="relative rounded-full bg-[#FF486E] p-[4px]">
                    <div className="absolute h-6 w-6 animate-ping rounded-full bg-[#FF486E]" />
                    <FingerPrintIcon className="relative h-6 w-6 text-white" />
                  </div>
                  <p>
                    {route.txsRequired - broadcastedTxs.length} SIGNATURES{" "}
                    {submitMutation.isPending ? "REMAINING" : "REQUIRED"}
                  </p>
                </>
              ) : null}
            </div>
          )}

          {submitMutation.isPending || submitMutation.isSuccess ? (
            <button
              className={cn(
                "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
                "outline-none transition-transform",
                "enabled:hover:rotate-1 enabled:hover:scale-105",
                "disabled:cursor-not-allowed disabled:opacity-75",
              )}
              onClick={control.close}
              disabled={route.txsRequired !== broadcastedTxs.length}
            >
              {route.txsRequired !== broadcastedTxs.length && !submitMutation.isSuccess ? (
                <svg
                  className="inline-block h-4 w-4 animate-spin text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx={12}
                    cy={12}
                    r={10}
                    stroke="currentColor"
                    strokeWidth={4}
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              ) : (
                <span>Create New {route.doesSwap ? "Swap" : "Transfer"}</span>
              )}
            </button>
          ) : (
            <SubmitButton />
          )}
        </div>
      </div>
    </div>
  );
};

const HREF_COMMON_FINALITY_TIMES = `https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions`;
