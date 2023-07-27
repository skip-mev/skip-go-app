import { FC, Fragment, useEffect, useRef, useState } from "react";
import { useChain, useManager } from "@cosmos-kit/react";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import Toast from "@/elements/Toast";
import { executeRoute } from "@/solve/form";
import RouteDisplay from "../RouteDisplay";
import { Route } from ".";
import { useSkipClient } from "@/solve";

interface Props {
  route: Route;
  insufficentBalance?: boolean;
  onClose: () => void;
}

const TransactionDialogContent: FC<Props> = ({
  route,
  onClose,
  insufficentBalance,
}) => {
  const skipClient = useSkipClient();

  const [transacting, setTransacting] = useState(false);

  const [isError, setIsError] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const [warningOpen, setWarningOpen] = useState(false);

  const warningEl = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (warningOpen) {
      warningEl.current?.scrollIntoView({
        behavior: "instant",
      });
    }
  }, [warningOpen]);

  const chain = useChain(route.sourceChain.record?.name ?? "");

  const { chainRecords } = useManager();
  const walletClient = chain.chainWallet?.client;

  const [txStatuses, setTxStatuses] = useState(() =>
    Array.from({ length: route.transactionCount }, () => "INIT")
  );

  const onSubmit = async () => {
    setTransacting(true);

    try {
      setTxStatuses(["PENDING", ...txStatuses.slice(1)]);

      if (!walletClient) {
        throw new Error("No wallet client found");
      }

      for (const chainID of route.rawRoute.chain_ids) {
        if (walletClient.addChain) {
          const record = chainRecords.find((c) => c.chain.chain_id === chainID);

          if (record) {
            await walletClient.addChain(record);
          }
        }
      }

      await executeRoute(
        skipClient,
        walletClient,
        route,
        (_, i) => {
          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];
            newStatuses[i] = "SUCCESS";

            if (i < statuses.length - 1) {
              newStatuses[i + 1] = "PENDING";
            }

            return newStatuses;
          });
        },
        (error: any) => {
          console.error(error);

          setTxError(error.message);
          setIsError(true);

          setTxStatuses((statuses) => {
            const newStatuses = [...statuses];

            return newStatuses.map((status) => {
              if (status === "PENDING") {
                return "INIT";
              }

              return status;
            });
          });
        }
      );
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
              {route.transactionCount} Transaction
              {route.transactionCount > 1 ? "s" : ""}
            </span>{" "}
            to complete
          </p>
        </div>
        <div className="flex-1 space-y-6">
          {txStatuses.map((status, i) => (
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
              <div>
                <p className="font-semibold">Transaction {i + 1}</p>
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
          {insufficentBalance && (
            <p className="text-center font-semibold text-sm text-red-500">
              Insufficient Balance
            </p>
          )}
        </div>

        {route.rawRoute.chain_ids.length > 1 && (
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
