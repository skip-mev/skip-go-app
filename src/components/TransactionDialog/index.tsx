import { RouteResponse } from "@skip-router/core";
import { FC, Fragment, useState } from "react";

import TransactionDialogContent from "./TransactionDialogContent";

export type ActionType = "NONE" | "TRANSFER" | "SWAP";

interface Props {
  route?: RouteResponse;
  transactionCount: number;
  insufficientBalance?: boolean;
}

const TransactionDialog: FC<Props> = ({
  route,
  insufficientBalance,
  transactionCount,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Fragment>
      <div>
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
          disabled={!route}
          onClick={() => setIsOpen(true)}
        >
          Preview Route
        </button>
        {isOpen && (
          <div className="absolute inset-0 bg-white rounded-3xl z-[999]">
            {route && (
              <TransactionDialogContent
                route={route}
                onClose={() => setIsOpen(false)}
                insufficentBalance={insufficientBalance}
                transactionCount={transactionCount}
              />
            )}
          </div>
        )}
      </div>
    </Fragment>
  );
};

export default TransactionDialog;
