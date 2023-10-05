import { coin, OfflineSigner } from "@cosmjs/proto-signing";
import { useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { Msg, RouteResponse } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { getWalletClient } from "@wagmi/core";
import { FC, Fragment, useEffect, useRef, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

import { Chain, useChains } from "@/api/queries";
import { useAssets } from "@/context/assets";
import { useToast } from "@/context/toast";
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
  const { getFeeDenom } = useAssets();

  const skipRouter = useSkipClient();
  const { address: evmAddress } = useAccount();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [transacting, setTransacting] = useState(false);

  const [isError, setIsError] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [txError, setTxError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [txComplete, setTxComplete] = useState(false);

  const [warningOpen, setWarningOpen] = useState(false);

  const warningEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (warningOpen) {
      warningEl.current?.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [warningOpen]);

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

  const { data: messages, isLoading } = useQuery({
    queryKey: ["route-messages", route],
    queryFn: async () => {
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

      return skipRouter.messages({
        sourceAssetDenom: route.sourceAssetDenom,
        sourceAssetChainID: route.sourceAssetChainID,
        destAssetDenom: route.destAssetDenom,
        destAssetChainID: route.destAssetChainID,
        amountIn: route.amountIn,
        amountOut: route.estimatedAmountOut ?? "0",
        addressList: route.chainIDs.map((chainID) => userAddresses[chainID]),
        operations: route.operations,
      });
      // skipRouter
    },
  });

  const { chains: evmChains } = useNetwork();

  const getEVMSigner = async (chainID: string) => {
    const result = await getWalletClient({
      chainId: parseInt(chainID),
    });

    if (!result) {
      throw new Error("No offline signer available");
    }

    const chain = evmChains.find((c) => c.id === parseInt(chainID));
    if (!chain) {
      throw new Error("No chain found");
    }
    result.chain = chain;

    return result;
  };

  const handleMessage = async (message: Msg, i: number) => {
    setTxStatuses((statuses) => {
      const newStatuses = [...statuses];

      newStatuses[i] = {
        status: "PENDING",
        explorerLink: null,
        txHash: null,
      };

      return newStatuses;
    });

    if ("multiChainMsg" in message) {
      const { multiChainMsg } = message;

      const feeDenom = getFeeDenom(multiChainMsg.chainID);

      const chain = chains.find((c) => c.chainID === multiChainMsg.chainID);
      if (!chain) {
        throw new Error(`No chain found for chainID ${multiChainMsg.chainID}`);
      }

      const walletClient = await getCosmosKitWalletClient(chain);

      const signerIsLedger = await isLedger(
        walletClient,
        multiChainMsg.chainID,
      );

      let signer: OfflineSigner;
      if (signerIsLedger) {
        signer = await getOfflineSignerOnlyAmino(
          walletClient,
          multiChainMsg.chainID,
        );
      } else {
        signer = await getOfflineSigner(walletClient, multiChainMsg.chainID);
      }

      const accounts = await signer.getAccounts();
      const account = accounts[0];

      const tx = await skipRouter.executeMultiChainMessage({
        signerAddress: account.address,
        signer,
        message: multiChainMsg,
        feeAmount: coin(0, feeDenom?.symbol ?? "uatom"),
      });

      if (tx.code !== 0) {
        console.error(tx);
        throw new Error(
          `Transaction ${tx.transactionHash} failed, check console for logs`,
        );
      }

      const explorerLink = getExplorerLinkForTx(
        multiChainMsg.chainID,
        tx.transactionHash,
      );

      setTxStatuses((statuses) => {
        const newStatuses = [...statuses];

        newStatuses[i] = {
          status: "SUCCESS",
          explorerLink,
          txHash: tx.transactionHash,
        };

        return newStatuses;
      });
    }

    if ("evmTx" in message) {
      const { evmTx } = message;

      const evmSigner = await getEVMSigner(evmTx.chainID);

      const txReceipt = await skipRouter.executeEVMTransaction({
        message: evmTx,
        signer: evmSigner,
      });

      if (txReceipt.status !== "success") {
        console.error(txReceipt);
        throw new Error(
          `Transaction ${txReceipt.transactionHash} failed, check console for logs`,
        );
      }

      const explorerLink = getExplorerLinkForTx(
        evmTx.chainID,
        txReceipt.transactionHash,
      );

      setTxStatuses((statuses) => {
        const newStatuses = [...statuses];

        newStatuses[i] = {
          status: "SUCCESS",
          explorerLink,
          txHash: txReceipt.transactionHash,
        };

        return newStatuses;
      });
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
          {isLoading && <div>Loading...</div>}
          {messages &&
            messages.map((message, i) => (
              <div key={`tx-${i}`} className="flex items-center gap-4">
                {txStatuses[i].status === "INIT" && (
                  <CheckCircleIcon className="text-neutral-300 w-7 h-7" />
                )}
                {txStatuses[i].status === "PENDING" && (
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
                {txStatuses[i].status === "SUCCESS" && (
                  <CheckCircleIcon className="text-emerald-400 w-7 h-7" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">
                    Transaction {i + 1}{" "}
                    {typeof txStatuses[i].explorerLink === "string" ? (
                      <a
                        className="text-sm font-bold text-[#FF486E] hover:underline"
                        href={txStatuses[i].explorerLink ?? ""}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Explorer
                      </a>
                    ) : null}
                  </p>
                </div>
                <div></div>
                <div>
                  <button
                    className="bg-[#FF486E]/20 hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 flex items-center gap-1 transition-colors focus:outline-none"
                    onClick={() => handleMessage(message, i)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            ))}
          {/* {txStatuses.map(({ status, explorerLink, txHash }, i) => (
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
          ))} */}
        </div>
        <div className="space-y-4">
          {/* <button
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
          </button> */}
          {insufficentBalance && !transacting && !txComplete && (
            <p className="text-center font-semibold text-sm text-red-500">
              Insufficient Balance
            </p>
          )}
        </div>
        {route.chainIDs.length > 1 && (
          <div className="bg-red-50 text-red-400 rounded-md">
            <button
              className="bg-red-50 text-red-400 font-medium uppercase text-xs p-3 flex items-center gap-2 w-full text-left"
              onClick={() => setWarningOpen(!warningOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path
                  fillRule="evenodd"
                  d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="flex-1">
                Execution Time Depends on IBC Relaying
              </span>
              {!warningOpen && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {warningOpen && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            {warningOpen && (
              <div className="px-4 pb-4 space-y-1 text-sm">
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
                  minutes but relayers may take longer to come online and
                  process the timeout.
                </p>
                <p>
                  In the medium term, we are working to rectify this by adding
                  packet tracking + relaying into the API. In the long term,
                  we&apos;re working to build better incentives for relaying, so
                  relayers don&apos;t need to run as charities. (Relayers do not
                  receive fees or payment of any kind today and subsidize gas
                  for users cross-chain)
                </p>
                <div ref={warningEl}></div>
              </div>
            )}
          </div>
        )}
      </div>
      <Toast open={isError} setOpen={setIsError} description={txError ?? ""} />
    </Fragment>
  );
};

export default TransactionDialogContent;
