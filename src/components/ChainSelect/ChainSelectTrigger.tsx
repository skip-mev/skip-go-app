import { ForwardedRef, forwardRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { Chain } from "@/context/chains";

interface Props {
  chain?: Chain;
}

const ChainSelectTrigger = forwardRef(function ChainSelectTrigger(
  { chain, ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      className="font-semibold text-left whitespace-nowrap bg-neutral-100 border border-neutral-200 hover:border-neutral-300 rounded-md flex items-center p-4 w-full transition-colors"
      ref={ref}
      {...props}
    >
      <span className="flex-1">
        {chain ? chain.prettyName : "Select Chain"}
      </span>
      <ChevronDownIcon className="mt-0.5 h-4 w-4" />
    </button>
  );
});

export default ChainSelectTrigger;
