import { useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon, CheckCircleIcon, InformationCircleIcon } from "@heroicons/react/20/solid";
import * as Sentry from "@sentry/react";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAccount as useWagmiAccount } from "wagmi";

import { useSettingsStore } from "@/context/settings";
import { addTxHistory, addTxStatus, failTxHistory, successTxHistory } from "@/context/tx-history";
import { useAccount } from "@/hooks/useAccount";
import { useChains } from "@/hooks/useChains";
import { useFinalityTimeEstimate } from "@/hooks/useFinalityTimeEstimate";
import { useSkipClient } from "@/solve";
import { isUserRejectedRequestError } from "@/utils/error";
import { getChainExplorerUrl } from "@/utils/explorer";

import RouteDisplay from "../RouteDisplay";
import { SpinnerIcon } from "../SpinnerIcon";
import TransactionSuccessView from "../TransactionSuccessView";
import * as AlertCollapse from "./AlertCollapse";

export interface RouteTransaction {
  status: "INIT" | "PENDING" | "SUCCESS";
  explorerLink: string | null | undefined;
  txHash: string | null | undefined;
}

interface Props {
  route: RouteResponse;
  transactionCount: number;
  insufficentBalance?: boolean | string;
  onClose: () => void;
}

export interface BroadcastedTx {
  chainID: string;
  txHash: string;
  explorerLink: string;
}

function TransactionDialogContent({ route, onClose, insufficentBalance, transactionCount }: Props) {
  const { data: chains = [] } = useChains();

  const skipClient = useSkipClient();
  const { address: evmAddress } = useWagmiAccount();

  const [transacting, setTransacting] = useState(false);

  const [txComplete, setTxComplete] = useState(false);
  const [isRouteExpanded, setIsRouteExpanded] = useState(false);
  const [broadcastedTxs, setBroadcastedTxs] = useState<BroadcastedTx[]>([]);

  const [txStatuses, setTxStatuses] = useState<RouteTransaction[]>(() =>
    Array.from({ length: transactionCount }, () => ({
      status: "INIT",
      explorerLink: null,
      txHash: null,
    })),
  );

  const { getWalletRepo } = useManager();

  const srcAccount = useAccount("source");
  const dstAccount = useAccount("destination");

  async function onSubmit() {
    setTransacting(true);
    setIsRouteExpanded(true);
    const [historyId] = addTxHistory({ route });

    try {
      const userAddresses: Record<string, string> = {};

      const srcChain = chains.find((c) => {
        return c.chainID === route.sourceAssetChainID;
      });
      const dstChain = chains.find((c) => {
        return c.chainID === route.destAssetChainID;
      });

      for (const chainID of route.chainIDs) {
        const chain = chains.find((c) => c.chainID === chainID);
        if (!chain) {
          throw new Error(`executeRoute error: cannot find chain '${chainID}'`);
        }

        if (chain.chainType === "cosmos") {
          const { wallets } = getWalletRepo(chain.chainName);

          const walletName = (() => {
            // if `chainID` is the source or destination chain
            if (srcChain?.chainID === chainID) {
              return srcAccount?.wallet?.walletName;
            }
            if (dstChain?.chainID === chainID) {
              return dstAccount?.wallet?.walletName;
            }

            // if `chainID` isn't the source or destination chain
            if (srcChain?.chainType === "cosmos") {
              return srcAccount?.wallet?.walletName;
            }
            if (dstChain?.chainType === "cosmos") {
              return dstAccount?.wallet?.walletName;
            }
          })();

          if (!walletName) {
            throw new Error(`executeRoute error: cannot find wallet for '${chain.chainName}'`);
          }

          const wallet = wallets.find((w) => w.walletName === walletName);
          if (!wallet) {
            throw new Error(`executeRoute error: cannot find wallet for '${chain.chainName}'`);
          }
          if (wallet.isWalletDisconnected || !wallet.isWalletConnected) {
            await wallet.connect();
          }
          if (!wallet.address) {
            throw new Error(`executeRoute error: cannot resolve wallet address for '${chain.chainName}'`);
          }
          userAddresses[chainID] = wallet.address;
        }

        if (chain.chainType === "evm") {
          if (!evmAddress) {
            throw new Error(`executeRoute error: evm wallet not connected`);
          }
          userAddresses[chainID] = evmAddress;
        }
      }

      setTxStatuses([
        {
          status: "PENDING",
          explorerLink: null,
          txHash: null,
        },
        ...txStatuses.slice(1),
      ]);

      await skipClient.executeRoute({
        route,
        userAddresses,
        validateGasBalance: route.txsRequired === 1,
        slippageTolerancePercent: useSettingsStore.getState().slippage,
        onTransactionBroadcast: async (txStatus) => {
          const makeExplorerUrl = await getChainExplorerUrl(txStatus.chainID);
          const explorerLink = makeExplorerUrl?.(txStatus.txHash);

          addTxStatus(historyId, {
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
        onTransactionCompleted: async (chainID, txHash) => {
          const makeExplorerUrl = await getChainExplorerUrl(chainID);
          const explorerLink = makeExplorerUrl?.(txHash);

          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];

            const pendingIndex = newStatuses.findIndex((status) => status.status === "PENDING");

            newStatuses[pendingIndex] = {
              status: "SUCCESS",
              explorerLink,
              txHash,
            };

            if (pendingIndex < statuses.length - 1) {
              newStatuses[pendingIndex + 1] = {
                status: "PENDING",
                explorerLink: null,
                txHash: null,
              };
            }

            return newStatuses;
          });
        },
      });

      setTxComplete(true);
    } catch (err: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
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

        toast.error(
          <p>
            <strong>Swap Failed!</strong>
            <br />
            {err.name}: {err.message}
          </p>,
        );
      }
      failTxHistory(historyId);
      setTxStatuses((statuses) => {
        const newStatuses = [...statuses];
        return newStatuses.map((status) => {
          if (status.status === "PENDING") {
            return {
              status: "INIT",
              explorerLink: null,
              txHash: null,
            };
          }
          return status;
        });
      });
    } finally {
      successTxHistory(historyId);
      setTransacting(false);
      setBroadcastedTxs([]);
    }
  }

  const estimatedFinalityTime = useFinalityTimeEstimate(route);

  if (txComplete) {
    return (
      <TransactionSuccessView
        route={route}
        transactions={txStatuses}
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
          isRouteExpanded={isRouteExpanded}
          setIsRouteExpanded={setIsRouteExpanded}
          broadcastedTxs={broadcastedTxs}
        />
      </div>

      <div className="flex-1 space-y-6">
        {txStatuses.map(({ status }, i) => (
          <div
            key={`tx-${i}`}
            className="flex items-center gap-4"
          >
            {status === "INIT" && <CheckCircleIcon className="h-7 w-7 text-neutral-300" />}
            {status === "PENDING" && <SpinnerIcon className="inline-block h-7 w-7 animate-spin text-neutral-300" />}
            {status === "SUCCESS" && <CheckCircleIcon className="h-7 w-7 text-emerald-400" />}
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
                    {broadcastedTxs[i].txHash.slice(0, 6)}
                    ...
                    {broadcastedTxs[i].txHash.slice(-6)}
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
        {transacting ? (
          <button
            className={clsx(
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
            className={clsx(
              "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white",
              "outline-none transition-transform",
              "enabled:hover:rotate-1 enabled:hover:scale-105",
              "disabled:cursor-not-allowed disabled:opacity-75",
            )}
            onClick={onSubmit}
            disabled={transacting || !!insufficentBalance}
          >
            Submit
          </button>
        )}
        {insufficentBalance && !transacting && !txComplete && (
          <p className="text-center text-sm font-semibold text-red-500">Insufficient Balance</p>
        )}
      </div>
    </div>
  );
}

const HREF_COMMON_FINALITY_TIMES = `https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions`;

export default TransactionDialogContent;
