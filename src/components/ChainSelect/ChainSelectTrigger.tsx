import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { forwardRef } from "react";

import { Chain } from "@/hooks/useChains";

interface Props {
  chain?: Chain;
}

const ChainSelectTrigger = forwardRef<HTMLButtonElement, Props>(
  function ChainSelectTrigger({ chain, ...props }, ref) {
    return (
      <button
        className={clsx(
          "flex items-center px-4 py-2 sm:py-4 w-full",
          "font-semibold text-left whitespace-nowrap bg-neutral-100 rounded-md transition-colors",
          "border border-neutral-200 hover:border-neutral-300",
        )}
        ref={ref}
        {...props}
      >
        <span className="flex-1">
          {chain ? chain.prettyName : "Select Chain"}
        </span>
        <ChevronDownIcon className="mt-0.5 h-4 w-4" />
      </button>
    );
  },
  //
);

export default ChainSelectTrigger;
