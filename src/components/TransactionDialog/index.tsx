import { RouteResponse } from "@skip-router/core";
import { FC, Fragment, useEffect, useState } from "react";

import { useDisclosureKey } from "@/context/disclosures";

import { PriceImpactWarning } from "../PriceImpactWarning";
import TransactionDialogContent from "./TransactionDialogContent";

export type ActionType = "NONE" | "TRANSFER" | "SWAP";

interface Props {
  isLoading?: boolean;
  route?: RouteResponse;
  transactionCount: number;
  insufficientBalance?: boolean;
  shouldShowPriceImpactWarning?: boolean;
}

const TransactionDialog: FC<Props> = ({
  isLoading,
  route,
  insufficientBalance,
  transactionCount,
  shouldShowPriceImpactWarning,
}) => {
  const [hasDisplayedWarning, setHasDisplayedWarning] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [, control] = useDisclosureKey("priceImpactWarning");

  useEffect(() => {
    if (!isOpen) {
      setHasDisplayedWarning(false);
      return;
    }

    if (hasDisplayedWarning) {
      return;
    }

    if (shouldShowPriceImpactWarning) {
      control.open();
      setHasDisplayedWarning(true);
    }
  }, [
    control,
    setHasDisplayedWarning,
    isOpen,
    hasDisplayedWarning,
    shouldShowPriceImpactWarning,
  ]);

  return (
    <Fragment>
      <div>
        <button
          className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
          disabled={!route || (typeof isLoading === "boolean" && isLoading)}
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
      <PriceImpactWarning onGoBack={() => setIsOpen(false)} />
    </Fragment>
  );
};

export default TransactionDialog;
