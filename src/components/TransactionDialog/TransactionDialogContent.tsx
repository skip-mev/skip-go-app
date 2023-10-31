import { useChain, useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { RouteResponse } from "@skip-router/core";
import { FC, Fragment, useState } from "react";

import { useAssets } from "@/context/assets";
import { Chain, useChains } from "@/context/chains";
import { useToast } from "@/context/toast";
import Toast from "@/elements/Toast";
import { executeRoute } from "@/solve/execute-route";
import { getChainByID } from "@/utils/utils";

import RouteDisplay from "../RouteDisplay";
import * as AlertCollapse from "./AlertCollapse";

const TransactionSuccessView: FC<{
  route: RouteResponse;
  onClose: () => void;
  transactions: RouteTransaction[];
}> = ({ route, onClose, transactions }) => {
  const { getAsset } = useAssets();
  const { chains } = useChains();

  const sourceAsset = getAsset(
    route.sourceAssetDenom,
    route.sourceAssetChainID,
  );
  const destinationAsset = getAsset(
    route.destAssetDenom,
    route.destAssetChainID,
  );

  const sourceChain = chains.find(
    (c) => c.chainID === route.sourceAssetChainID,
  ) as Chain;
  const destinationChain = chains.find(
    (c) => c.chainID === route.destAssetChainID,
  ) as Chain;

  return (
    <div className="flex flex-col items-center h-full px-4 py-6 pt-28 overflow-y-auto scrollbar-hide">
      <div className="text-emerald-400">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-[100px] h-[100px]"
        >
          <path
            fillRule="evenodd"
            d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div>
        <p className="font-bold text-3xl mb-4">
          {route.doesSwap ? "Swap" : "Transfer"} Successful
        </p>
      </div>
      <p className="font-medium text-neutral-400 pb-8 text-center">
        {route.doesSwap &&
          `Successfully swapped ${
            sourceAsset?.symbol ?? route.sourceAssetDenom
          } for ${destinationAsset?.symbol ?? route.destAssetDenom}`}
        {!route.doesSwap &&
          `Successfully transfered ${
            sourceAsset?.symbol ?? route.sourceAssetDenom
          } from ${sourceChain.prettyName} to ${destinationChain.prettyName}`}
      </p>
      <div className="flex-1 space-y-6 w-full">
        {transactions.map(({ explorerLink, txHash }, i) => (
          <div key={`tx-${i}`} className="flex items-center gap-4">
            <CheckCircleIcon className="text-emerald-400 w-7 h-7" />
            <div className="flex-1">
              <p className="font-semibold">Transaction {i + 1}</p>
            </div>
            <div>
              {explorerLink && txHash && (
                <a
                  className="text-sm font-bold text-[#FF486E] hover:underline"
                  href={explorerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span>
                    <span>
                      {txHash.slice(0, 6)}
                      ...
                      {txHash.slice(-6)}
                    </span>
                  </span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="w-full">
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
          onClick={onClose}
        >
          {route.doesSwap ? "Swap" : "Transfer"} Again
        </button>
      </div>
    </div>
  );
};

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
  const { toast } = useToast();

  const [transacting, setTransacting] = useState(false);

  const [isError, setIsError] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const [txComplete, setTxComplete] = useState(false);

  const chainRecord = getChainByID(route.sourceAssetChainID);

  const chain = useChain(chainRecord?.chain_name);

  const { chainRecords } = useManager();
  const walletClient = chain.chainWallet?.client;

  const [txStatuses, setTxStatuses] = useState<RouteTransaction[]>(() =>
    Array.from({ length: transactionCount }, () => {
      return {
        status: "INIT",
        explorerLink: null,
        txHash: null,
      };
    }),
  );

  const onSubmit = async () => {
    setTransacting(true);

    try {
      setTxStatuses([
        {
          status: "PENDING",
          explorerLink: null,
          txHash: null,
        },
        ...txStatuses.slice(1),
      ]);

      if (!walletClient) {
        throw new Error("No wallet client found");
      }

      for (const chainID of route.chainIDs) {
        if ("snapInstalled" in walletClient) {
          continue;
        }

        if (walletClient.addChain) {
          const record = chainRecords.find((c) => c.chain.chain_id === chainID);
          if (record) {
            try {
              await walletClient.addChain(record);
            } catch (err) {
              /* empty */
            }
          }
        }
      }

      await executeRoute(
        walletClient,
        route,
        ({ txHash, explorerLink }, i) => {
          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];
            newStatuses[i] = {
              status: "SUCCESS",
              explorerLink,
              txHash,
            };

            if (i < statuses.length - 1) {
              newStatuses[i + 1] = {
                status: "PENDING",
                explorerLink: null,
                txHash: null,
              };
            }
            return newStatuses;
          });
        },
        // (error: any) => {
        //   console.error(error);
        //   setTxError(error.message);
        //   setIsError(true);
        //   setTxStatuses((statuses) => {
        //     const newStatuses = [...statuses];
        //     return newStatuses.map((status) => {
        //       if (status.status === "PENDING") {
        //         return {
        //           status: "INIT",
        //           explorerLink: null,
        //           txHash: null,
        //         };
        //       }
        //       return status;
        //     });
        //   });
        // }
      );

      toast(
        "Transaction Successful",
        "Your transaction was successful",
        "success",
      );

      setTxComplete(true);
    } catch (err: unknown) {
      console.error(err);

      if (err instanceof Error) {
        setTxError(err.message);
        setIsError(true);
      }

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
            className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
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
          <AlertCollapse.Root type="info">
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
