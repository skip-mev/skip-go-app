import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import { useEffect, useMemo } from "react";
import { tinykeys } from "tinykeys";

import { useAssets } from "@/context/assets";
import { useDisclosureKey } from "@/context/disclosures";
import { useTxHistory } from "@/context/tx-history";

import { HistoryClearButton } from "./HistoryClearButton";
import * as HistoryList from "./HistoryList";

export const HistoryDialog = () => {
  const [isOpen, { close }] = useDisclosureKey("historyDialog");

  const history = useTxHistory();
  const { isReady } = useAssets();

  const entries = useMemo(() => {
    return isReady ? Object.entries(history).reverse() : undefined;
  }, [history, isReady]);

  useEffect(() => tinykeys(window, { ["Escape"]: () => close() }), [close]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-white rounded-3xl z-[999]">
      <div className="flex flex-col h-full px-4 py-6 space-y-2">
        <div className="flex items-center gap-4 pb-2">
          <button
            className="hover:bg-neutral-100 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            onClick={close}
          >
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
          <h3 className="font-bold text-xl">Transaction History</h3>
          <div className="flex-grow" />
          <HistoryClearButton />
        </div>
        <div className="h-full">
          <HistoryList.Root>
            {entries && entries.length < 1 && (
              <span className="text-center text-sm opacity-60 p-2">
                No recent transactions.
              </span>
            )}
            {entries?.map(([id, data]) => (
              <HistoryList.Item key={id} id={id} data={data} />
            ))}
            {!isReady && (
              <div className="text-center p-4 opacity-60">
                Loading transaction history...
              </div>
            )}
          </HistoryList.Root>
        </div>
      </div>
    </div>
  );
};
