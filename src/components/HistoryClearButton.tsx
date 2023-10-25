import { TrashIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { ComponentProps } from "react";

type Props = ComponentProps<"button">;

export const HistoryClearButton = ({ className, ...props }: Props) => {
  return (
    <Tooltip.Provider delayDuration={0}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={clsx(
              "text-xs font-semibold text-[#FF486E]",
              "bg-[#FF486E]/20 hover:bg-[#FF486E]/30",
              "rounded-lg p-2",
              "flex items-center gap-1",
              "transition-colors focus:outline-none",
              className,
            )}
            {...props}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className={clsx(
              "rounded-md bg-[#fbeef1] px-4 py-2 leading-none",
              "select-none shadow z-[9999]",
              "text-sm text-[#FF486E] font-medium",
            )}
          >
            Clear transaction history
            <Tooltip.Arrow className="fill-[#fbeef1]" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};
