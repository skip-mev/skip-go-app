import { ComponentProps } from "react";

import { disclosure } from "@/context/disclosures";
import { cn } from "@/utils/ui";

import { HistoryIcon } from "./HistoryIcon";
import { SimpleTooltip } from "./SimpleTooltip";

export const HistoryButton = ({ className, ...props }: ComponentProps<"button">) => {
  return (
    <SimpleTooltip label="Transaction History">
      <button
        className={cn(
          "rounded-full p-2 text-black/80 hover:bg-neutral-100 hover:text-black/100",
          "transition-colors focus:outline-none",
          className,
        )}
        onClick={() => disclosure.open("historyDialog")}
        role="group"
        {...props}
      >
        <HistoryIcon className="h-4 w-4" />
      </button>
    </SimpleTooltip>
  );
};
