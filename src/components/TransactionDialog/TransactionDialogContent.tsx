import { useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { FC, Fragment, useState } from "react";
import { useAccount } from "wagmi";

import { Chain, useChains } from "@/api/queries";
import { useToast } from "@/context/toast";
import {
  addTxHistory,
  addTxStatus,
  removeTxHistory,
} from "@/context/tx-history";
import Toast from "@/elements/Toast";
import { useSkipClient } from "@/solve";
import {
  enableChains,
  getAddressForCosmosChain,
  getExplorerLinkForTx,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  isLedger,
} from "@/utils/utils";

import RouteDisplay from "../RouteDisplay";
import * as AlertCollapse from "./AlertCollapse";

interface RouteTransaction {
  status: "INIT" | "PENDING" | "SUCCESS";
  explorerLink: string | null;
  txHash: string | null;
}

interface Props {
  route: RouteResponse;
  transactionCount: number;
  insufficentBalance?: boolean;
  onClose: () => void;
}

const TransactionDialogContent: FC<Props> = ({
  route,
  onClose,
  insufficentBalance,
  transactionCount,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { toast } = useToast();
  const { chains: skipChains } = useChains();

  const chains = skipChains ?? [];

  const skipRouter = useSkipClient();
  const { address: evmAddress } = useAccount();

  const [transacting, setTransacting] = useState(false);

  const [isError, setIsError] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [txComplete, setTxComplete] = useState(false);

  const { getWalletRepo } = useManager();

  const [txStatuses, setTxStatuses] = useState<RouteTransaction[]>(() =>
    Array.from({ length: transactionCount }, () => {
      return {
        status: "INIT",
        explorerLink: null,
        txHash: null,
      };
    }),
  );

  async function getCosmosKitWalletClient(chain: Chain) {
    const walletRepo = await getWalletRepo(chain.record?.chain_name ?? "");

    const currentCosmosKitWallet = localStorage.getItem(
      "cosmos-kit@2:core//current-wallet",
    );

    if (!currentCosmosKitWallet) {
      throw new Error("No CosmosKit wallet found");
    }

    const wallet = walletRepo.getWallet(currentCosmosKitWallet);
    if (!wallet) {
      throw new Error("No wallet found");
    }

    return wallet.client;
  }

  const onSubmit = async () => {
    setTransacting(true);

    const [historyId] = addTxHistory({ route });

    try {
      const userAddresses: Record<string, string> = {};
      const addressList = [];

      // get addresses
      for (const chainID of route.chainIDs) {
        const chain = chains.find((c) => c.chainID === chainID);
        if (!chain) {
          throw new Error(`No chain found for chainID ${chainID}`);
        }

        if (chain.chainType === "cosmos") {
          const walletClient = await getCosmosKitWalletClient(chain);
          await enableChains(walletClient, [chainID]);
          const address = await getAddressForCosmosChain(walletClient, chainID);
          userAddresses[chainID] = address;
          addressList.push(address);
        }

        if (chain.chainType === "evm") {
          if (!evmAddress) {
            throw new Error(`EVM wallet not connected`);
          }

          userAddresses[chainID] = evmAddress;
          addressList.push(evmAddress);
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

      await skipRouter.executeRoute({
        route,
        userAddresses,
        validateGasBalance: true,
        getCosmosSigner: async (chainID) => {
          const chain = chains.find((c) => c.chainID === chainID);
          if (!chain) {
            throw new Error(`No chain found for chainID ${chainID}`);
          }

          const walletClient = await getCosmosKitWalletClient(chain);

          const signerIsLedger = await isLedger(walletClient, chainID);

          if (signerIsLedger) {
            return getOfflineSignerOnlyAmino(walletClient, chainID);
          }

          return getOfflineSigner(walletClient, chainID);
        },
        onTransactionSuccess: async (txStatus) => {
          const explorerLink = getExplorerLinkForTx(
            txStatus.chainID,
            txStatus.txHash,
          );

          addTxStatus(historyId, {
            chainId: txStatus.chainID,
            txHash: txStatus.txHash,
            explorerLink: explorerLink || "#",
          });

          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];

            const pendingIndex = newStatuses.findIndex(
              (status) => status.status === "PENDING",
            );

            newStatuses[pendingIndex] = {
              status: "SUCCESS",
              explorerLink,
              txHash: txStatus.txHash,
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
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setTxError(err.message);
        setIsError(true);
      }
      removeTxHistory(historyId);
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
      setTransacting(false);
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col h-full px-4 py-6 space-y-6 overflow-y-auto scrollbar-hide">
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
        <div className="flex-1 space-y-6">
          {txStatuses.map(({ status, explorerLink, txHash }, i) => (
            <div key={`tx-${i}`} className="flex items-center gap-4">
              {status === "INIT" && (
                <CheckCircleIcon className="text-neutral-300 w-7 h-7" />
              )}
              {status === "PENDING" && (
                <svg
                  className="animate-spin h-7 w-7 inline-block text-neutral-300"
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
            {transacting ? (
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
              <span>Submit</span>
            )}
          </button>
          {insufficentBalance && !transacting && !txComplete && (
            <p className="text-center font-semibold text-sm text-red-500">
              Insufficient Balance
            </p>
          )}
        </div>
        {route.chainIDs.length > 1 && (
          <AlertCollapse.Root>
            <AlertCollapse.Trigger>
              Execution Time Depends on IBC Relaying
            </AlertCollapse.Trigger>
            <AlertCollapse.Content>
              <p>This swap contains at least one IBC transfer.</p>
              <p>
                IBC transfers usually take 10-30 seconds, depending on block
                times + how quickly relayers ferry packets. But relayers
                frequently crash or fail to relay packets for hours or days on
                some chains (especially chains with low IBC volume).
              </p>
              <p>
                At this time, the Skip API does not relay packets itself, so
                your swap/transfer may hang in an incomplete state. If this
                happens, your funds are stuck, not lost. They will be returned
                to you once a relayer comes back online and informs the source
                chain that the packet has timed out. Timeouts are set to 5
                minutes but relayers may take longer to come online and process
                the timeout.
              </p>
              <p>
                In the medium term, we are working to rectify this by adding
                packet tracking + relaying into the API. In the long term,
                we&apos;re working to build better incentives for relaying, so
                relayers don&apos;t need to run as charities. (Relayers do not
                receive fees or payment of any kind today and subsidize gas for
                users cross-chain)
              </p>
            </AlertCollapse.Content>
          </AlertCollapse.Root>
        )}
      </div>
      <Toast open={isError} setOpen={setIsError} description={txError ?? ""} />
    </Fragment>
  );
};

export default TransactionDialogContent;
