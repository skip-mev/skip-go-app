import { ArrowLeftIcon, CheckCircleIcon, InformationCircleIcon, XMarkIcon } from "@heroicons/react/20/solid";
import * as Sentry from "@sentry/react";
import { RouteResponse } from "@skip-router/core";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { getHotfixedGasPrice } from "@/constants/gas";
import { useSettingsStore } from "@/context/settings";
import { txHistory } from "@/context/tx-history";
import { useAccount } from "@/hooks/useAccount";
import { useFinalityTimeEstimate } from "@/hooks/useFinalityTimeEstimate";
import { useWalletAddresses } from "@/hooks/useWalletAddresses";
import { useBroadcastedTxsStatus, useSkipClient } from "@/solve";
import { isUserRejectedRequestError } from "@/utils/error";
import { getExplorerUrl } from "@/utils/explorer";
import { randomId } from "@/utils/random";
import { cn } from "@/utils/ui";

import RouteDisplay from "../RouteDisplay";
import { SpinnerIcon } from "../SpinnerIcon";
import TransactionSuccessView from "../TransactionSuccessView";
import * as AlertCollapse from "./AlertCollapse";

interface Props {
  route: RouteResponse;
  transactionCount: number;
  isAmountError?: boolean | string;
  onClose: () => void;
  onAllTransactionComplete?: () => void;
}

export interface BroadcastedTx {
  chainID: string;
  txHash: string;
  explorerLink: string;
}

function TransactionDialogContent({ route, onClose, isAmountError, transactionCount }: Props) {
  const skipClient = useSkipClient();

  const [isOngoing, setOngoing] = useState(false);

  const [isTxComplete, setTxComplete] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [broadcastedTxs, setBroadcastedTxs] = useState<BroadcastedTx[]>([]);

  const txStatus = useBroadcastedTxsStatus({
    txs: broadcastedTxs,
    txsRequired: route.txsRequired,
  });

  const srcAccount = useAccount("source");
  const dstAccount = useAccount("destination");

  const { data: userAddresses } = useWalletAddresses(route.chainIDs);

  async function onSubmit() {
    if (!userAddresses) return;
    setOngoing(true);
    setIsExpanded(true);
    const historyId = randomId();
    try {
      await skipClient.executeRoute({
        route,
        userAddresses,
        validateGasBalance: route.txsRequired === 1,
        slippageTolerancePercent: useSettingsStore.getState().slippage,
        getGasPrice: getHotfixedGasPrice,
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

      setTxComplete(true);
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        if (!isUserRejectedRequestError(err)) {
          Sentry.withScope((scope) => {
            scope.setUser({
              id: srcAccount?.address,
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
              sourceAddress: srcAccount?.address,
              destinationAddress: dstAccount?.address,
              sourceChain: route.sourceAssetChainID,
              destinationChain: route.destAssetChainID,
              sourceAssetDenom: route.sourceAssetDenom,
              destinationAssetDenom: route.destAssetDenom,
              amountIn: route.amountIn,
              amountOut: route.amountOut,
            });
            Sentry.captureException(err);
          });
        }

        toast(
          ({ createdAt, id }) => (
            <div className="flex flex-col">
              <h4 className="mb-2 font-bold">Swap Failed!</h4>
              <pre className="mb-4 select-all overflow-auto whitespace-pre-wrap break-all rounded border p-2 font-mono text-xs">
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
      }
    } finally {
      setOngoing(false);
    }
  }

  const estimatedFinalityTime = useFinalityTimeEstimate(route);

  if (isTxComplete && txStatus.data?.isSuccess) {
    return (
      <TransactionSuccessView
        route={route}
        transactions={broadcastedTxs}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex h-full flex-col space-y-6 overflow-y-auto p-6 scrollbar-hide">
      <div>
        <div className="flex items-center gap-4">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
            onClick={onClose}
          >
            <ArrowLeftIcon className="h-6 w-6" />
          </button>
          <p className="text-xl font-bold">Transaction Preview</p>
        </div>
      </div>
      <div className="rounded-xl border border-neutral-300 p-4">
        <RouteDisplay
          route={route}
          isRouteExpanded={isExpanded}
          setIsRouteExpanded={setIsExpanded}
          broadcastedTxs={broadcastedTxs}
        />
      </div>

      <div className="flex-1 space-y-6">
        {broadcastedTxs.map(({ txHash }, i) => (
          <div
            key={`tx-${i}`}
            className="flex items-center gap-4"
          >
            {txStatus.data?.states?.[i] === "STATE_COMPLETED_SUCCESS" ? (
              <CheckCircleIcon className="h-7 w-7 text-emerald-400" />
            ) : txStatus.data?.states?.[i] === "STATE_COMPLETED_ERROR" ? (
              <XMarkIcon className="h-7 w-7 rounded-full bg-red-400 text-white" />
            ) : (
              <SpinnerIcon className="inline-block h-7 w-7 animate-spin text-neutral-300" />
            )}
            <div className="flex-1">
              <p className="font-semibold">Transaction {i + 1}</p>
            </div>
            <div>
              {broadcastedTxs[i] && (
                <a
                  className="text-sm font-bold text-[#FF486E] hover:underline"
                  href={broadcastedTxs[i].explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    {txHash.slice(0, 6)}
                    ...
                    {txHash.slice(-6)}
                  </span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
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
        {isAmountError && !isOngoing && !isTxComplete && (
          <p className="text-balance text-center text-sm font-medium text-red-500">
            {typeof isAmountError === "string" ? isAmountError : "Insufficient balance."}
          </p>
        )}
        <div className="flex w-full items-center rounded-md bg-black p-3 text-left text-xs font-medium uppercase text-white/50">
          <p className="flex-1">
            This route requires{" "}
            <span className="text-white">
              {transactionCount} Transaction
              {transactionCount > 1 ? "s" : ""}
            </span>{" "}
            to complete
          </p>
        </div>
        {isOngoing ? (
          <button
            className={cn(
              "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
              "outline-none transition-transform",
              "enabled:hover:rotate-1 enabled:hover:scale-105",
              "disabled:cursor-not-allowed disabled:opacity-75",
            )}
            onClick={onClose}
            disabled={route.txsRequired !== broadcastedTxs.length}
          >
            {route.txsRequired !== broadcastedTxs.length ? (
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
          <button
            className={cn(
              "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
              "outline-none transition-transform",
              "enabled:hover:rotate-1 enabled:hover:scale-105",
              "disabled:cursor-not-allowed disabled:opacity-75",
            )}
            onClick={onSubmit}
            disabled={isOngoing || !!isAmountError}
          >
            Submit
          </button>
        )}
      </div>
    </div>
  );
}

const HREF_COMMON_FINALITY_TIMES = `https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions`;

export default TransactionDialogContent;
