import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { Fragment, useEffect, useState } from "react";

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
  routeWarningMessage?: string;
  routeWarningTitle?: string;
}

function TransactionDialog({
  isLoading,
  route,
  insufficientBalance,
  transactionCount,
  shouldShowPriceImpactWarning,
  routeWarningMessage,
  routeWarningTitle,
}: Props) {
  const [hasDisplayedWarning, setHasDisplayedWarning] = useState(false);
  const [isOpen, { set: setIsOpen }] = useDisclosureKey("confirmSwapDialog");

  const [, control] = useDisclosureKey("priceImpactDialog");

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
  }, [control, setHasDisplayedWarning, isOpen, hasDisplayedWarning, shouldShowPriceImpactWarning]);

  return (
    <Fragment>
      <div>
        <button
          className={clsx(
            "w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white outline-none transition-[opacity,transform]",
            "disabled:cursor-not-allowed disabled:opacity-75",
            "enabled:hover:rotate-1 enabled:hover:scale-105",
          )}
          disabled={!route || (typeof isLoading === "boolean" && isLoading)}
          onClick={() => setIsOpen(true)}
        >
          Preview Route
        </button>
        {isOpen && (
          <div className="absolute inset-0 animate-fade-zoom-in rounded-3xl bg-white">
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
      <PriceImpactWarning
        onGoBack={() => setIsOpen(false)}
        message={routeWarningMessage}
        title={routeWarningTitle}
      />
    </Fragment>
  );
}

export default TransactionDialog;
