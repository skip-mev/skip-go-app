import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as ScrollArea from "@radix-ui/react-scroll-area";
import { clsx } from "clsx";
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
    <div className="absolute inset-0 bg-white rounded-3xl animate-fade-zoom-in">
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
        <ScrollArea.Root
          className={clsx(
            "overflow-hidden -mx-4 relative",
            "before:absolute before:bottom-0 before:inset-x-0 before:h-2 before:z-10",
            "before:bg-gradient-to-t before:from-white before:to-transparent",
          )}
        >
          <ScrollArea.Viewport className="w-full h-full px-4">
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
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="z-20 flex select-none touch-none p-0.5 transition-colors duration-[160ms] ease-out  data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="flex-1 bg-neutral-500 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[54px] before:min-h-[54px]" />
          </ScrollArea.Scrollbar>
          <ScrollArea.Corner />
        </ScrollArea.Root>
      </div>
    </div>
  );
};
