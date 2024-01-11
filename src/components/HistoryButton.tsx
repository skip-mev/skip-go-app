import { clsx } from "clsx";
import { ComponentProps } from "react";

import { disclosure } from "@/context/disclosures";

import { HistoryIcon } from "./HistoryIcon";
import { SimpleTooltip } from "./SimpleTooltip";

export const HistoryButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <SimpleTooltip label="Transaction History">
      <button
        className={clsx(
          "p-2 rounded-full text-black/80 hover:text-black/100 hover:bg-neutral-100",
          "focus:outline-none transition-colors",
          className,
        )}
        onClick={() => disclosure.open("historyDialog")}
        role="group"
        {...props}
      >
        <HistoryIcon className="w-4 h-4" />
      </button>
    </SimpleTooltip>
  );
};
