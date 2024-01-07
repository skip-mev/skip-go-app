import { TrashIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { ComponentProps } from "react";

import { clearTxHistory, useTxHistory } from "@/context/tx-history";

import { SimpleTooltip } from "../SimpleTooltip";

type Props = ComponentProps<"button">;

export const HistoryClearButton = ({ className, ...props }: Props) => {
  const hasHistory = useTxHistory((state) => Object.keys(state).length > 0);

  if (!hasHistory) return null;

  return (
    <SimpleTooltip label="Clear transaction history" type="warning">
      <button
        className={clsx(
          "text-xs font-semibold text-[#FF486E]",
          "bg-[#FF486E]/20 hover:bg-[#FF486E]/30",
          "rounded-lg p-2",
          "flex items-center gap-1",
          "transition-colors focus:outline-none",
          className,
        )}
        onClick={() => clearTxHistory()}
        {...props}
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </SimpleTooltip>
  );
};
