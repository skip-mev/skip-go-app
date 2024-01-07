import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useAccount } from "wagmi";

import { useSettingsStore } from "@/context/settings";
import {
  addTxHistory,
  addTxStatus,
  failTxHistory,
  successTxHistory,
} from "@/context/tx-history";
import { useChains } from "@/hooks/useChains";
import { useFinalityTimeEstimate } from "@/hooks/useFinalityTimeEstimate";
import { useGetChainWalletClient } from "@/hooks/useGetChainWalletClient";
import { useSkipClient } from "@/solve";
import { enableChains, getAddressForCosmosChain } from "@/utils/chain";
import { getChainExplorerUrl } from "@/utils/explorer";
import { getOfflineSigner } from "@/utils/signer";

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
  insufficentBalance?: boolean;
  onClose: () => void;
}

function TransactionDialogContent({
  route,
  onClose,
  insufficentBalance,
  transactionCount,
}: Props) {
  const { data: chains = [] } = useChains();

  const skipClient = useSkipClient();
  const { address: evmAddress } = useAccount();

  const [transacting, setTransacting] = useState(false);

  const [txComplete, setTxComplete] = useState(false);
  const [numberOfBroadcastedTransactions, setNumberOfBroadcastedTransactions] =
    useState(0);

  const [txStatuses, setTxStatuses] = useState<RouteTransaction[]>(() =>
    Array.from({ length: transactionCount }, () => {
      return {
        status: "INIT",
        explorerLink: null,
        txHash: null,
      };
    }),
  );

  const getChainWalletClient = useGetChainWalletClient();

  const onSubmit = async () => {
    setTransacting(true);

    const [historyId] = addTxHistory({ route });

    try {
      const userAddresses: Record<string, string> = {};

      // get addresses
      for (const chainID of route.chainIDs) {
        const chain = chains.find((c) => c.chainID === chainID);
        if (!chain) {
          throw new Error(`No chain found for chainID ${chainID}`);
        }

        if (chain.chainType === "cosmos") {
          const walletClient = getChainWalletClient(chain.chainName ?? "");
          await enableChains(walletClient, [chainID]);
          const address = await getAddressForCosmosChain(walletClient, chainID);
          userAddresses[chainID] = address;
        }

        if (chain.chainType === "evm") {
          if (!evmAddress) {
            throw new Error(`EVM wallet not connected`);
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
        validateGasBalance: true,
        slippageTolerancePercent: useSettingsStore.getState().slippage,
        getCosmosSigner: async (chainID) => {
          const chain = chains.find((c) => c.chainID === chainID);
          if (!chain) {
            throw new Error(`No chain found for chainID ${chainID}`);
          }

          const walletClient = getChainWalletClient(chain.chainName ?? "");

          return getOfflineSigner(walletClient, chainID);
        },
        onTransactionBroadcast: async (txStatus) => {
          const makeExplorerUrl = await getChainExplorerUrl(txStatus.chainID);
          const explorerLink = makeExplorerUrl?.(txStatus.txHash);

          addTxStatus(historyId, {
            chainId: txStatus.chainID,
            txHash: txStatus.txHash,
            explorerLink: explorerLink || "#",
          });

          setNumberOfBroadcastedTransactions(
            (numberOfBroadcastedTransactions) =>
              numberOfBroadcastedTransactions + 1,
          );
        },
        onTransactionCompleted: async (chainID, txHash) => {
          const makeExplorerUrl = await getChainExplorerUrl(chainID);
          const explorerLink = makeExplorerUrl?.(txHash);

          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];

            const pendingIndex = newStatuses.findIndex(
              (status) => status.status === "PENDING",
            );

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
      setNumberOfBroadcastedTransactions(0);
    }
  };

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
    <div className="flex flex-col h-full p-6 space-y-6 overflow-y-auto scrollbar-hide">
      <div>
        <div className="flex items-center gap-4">
          <button
            className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={onClose}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <p className="font-bold text-xl">Transaction Preview</p>
        </div>
      </div>
      <div className="border border-neutral-300 rounded-xl p-4">
        <RouteDisplay route={route} />
      </div>

      <div className="flex-1 space-y-6">
        {txStatuses.map(({ status, explorerLink, txHash }, i) => (
          <div key={`tx-${i}`} className="flex items-center gap-4">
            {status === "INIT" && (
              <CheckCircleIcon className="text-neutral-300 w-7 h-7" />
            )}
            {status === "PENDING" && (
              <SpinnerIcon className="animate-spin h-7 w-7 inline-block text-neutral-300" />
            )}
            {status === "SUCCESS" && (
              <CheckCircleIcon className="text-emerald-400 w-7 h-7" />
            )}
            <div className="flex-1">
              <p className="font-semibold">Transaction {i + 1}</p>
            </div>
            <div>
              {txHash && explorerLink && (
                <a
                  className="text-sm font-bold text-[#FF486E] hover:underline"
                  href={explorerLink}
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
            <AlertCollapse.Trigger>
              EVM bridging finality time is {estimatedFinalityTime}
            </AlertCollapse.Trigger>
            <AlertCollapse.Content>
              <p>
                This swap contains at least one EVM chain, so it might take
                longer. Read more about{" "}
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
        <div className="bg-black text-white/50 font-medium uppercase text-xs p-3 rounded-md flex items-center w-full text-left">
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
              "bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full",
              "transition-transform outline-none",
              "enabled:hover:scale-105 enabled:hover:rotate-1",
              "disabled:cursor-not-allowed disabled:opacity-75",
            )}
            onClick={onClose}
            disabled={route.txsRequired !== numberOfBroadcastedTransactions}
          >
            {route.txsRequired !== numberOfBroadcastedTransactions ? (
              <svg
                className="animate-spin h-4 w-4 inline-block text-white"
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
              <span>{route.doesSwap ? "Swap" : "Transfer"} Again</span>
            )}
          </button>
        ) : (
          <button
            className={clsx(
              "bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full",
              "transition-transform outline-none",
              "enabled:hover:scale-105 enabled:hover:rotate-1",
              "disabled:cursor-not-allowed disabled:opacity-75",
            )}
            onClick={onSubmit}
            disabled={transacting || insufficentBalance}
          >
            Submit
          </button>
        )}
        {insufficentBalance && !transacting && !txComplete && (
          <p className="text-center font-semibold text-sm text-red-500">
            Insufficient Balance
          </p>
        )}
      </div>
    </div>
  );
}

const HREF_COMMON_FINALITY_TIMES = `https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions`;

export default TransactionDialogContent;
