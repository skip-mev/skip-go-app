import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { FC, Fragment, useState } from "react";
import RouteDisplay from "../RouteDisplay";
import { Route } from ".";
import { executeRoute } from "@/solve/form";
import Toast from "@/elements/Toast";
import { useWallet, useWalletClient } from "@cosmos-kit/react";

interface Props {
  route: Route;
  onClose: () => void;
}

const TransactionDialogContent: FC<Props> = ({ route, onClose }) => {
  const [transacting, setTransacting] = useState(false);

  const [isError, setIsError] = useState(false);
  const [txError, setTxError] = useState<string | null>(null);

  const wallet = useWallet();

  // console.log(wallet.wallet.);

  const { client: walletClient } = useWalletClient();

  // console.log(walletClient);

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

      await executeRoute(
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
        <div>
          <button
            className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed"
            onClick={onSubmit}
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
        </div>
      </div>
      <Toast open={isError} setOpen={setIsError} description={txError ?? ""} />
    </Fragment>
  );
};

export default TransactionDialogContent;
