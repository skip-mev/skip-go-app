import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { clsx } from "clsx";
import { useState } from "react";

import { useSettingsStore } from "@/context/settings";

import { FormValues } from "./useSwapWidget";

type Props = FormValues & {
  amountOut: string;
};

export const SwapDetails = ({
  amountIn,
  amountOut,
  sourceChain,
  sourceAsset,
  destinationChain,
  destinationAsset,
}: Props) => {
  const [open, setOpen] = useState(false);

  const { slippage } = useSettingsStore();

  if (!(sourceChain && sourceAsset && destinationChain && destinationAsset)) {
    return null;
  }

  const isEvm =
    sourceChain?.chainType === "evm" || destinationChain?.chainType === "evm";

  return (
    <Collapsible.Root
      className="space-y-4 border border-neutral-200 px-4 py-2 rounded-lg text-sm"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="flex flex-col items-center text-center space-y-1 relative">
        <div>
          <span className="mr-1">
            {amountIn} {sourceAsset?.denom} ={" "}
            {(parseFloat(amountIn) / parseFloat(amountOut)).toFixed(8)}{" "}
            {destinationAsset.denom}
          </span>
          <span className="text-neutral-400">($0.123)</span>
        </div>
        <Collapsible.Trigger
          className={clsx(
            "flex items-center text-xs text-neutral-400",
            "before:absolute before:inset-0 before:content-['']",
          )}
        >
          <span>{open ? "Hide" : "Show"} Details</span>
          <ChevronDownIcon
            className={clsx(
              "w-4 h-4 transition",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content asChild>
        <dl
          className={clsx(
            "grid grid-cols-2 gap-2 pb-2",
            "[&_dt]:text-neutral-400 [&_dt]:text-start",
            "[&_dd]:text-end [&_dd]:tabular-nums",
          )}
        >
          <dt>Max Slippage</dt>
          <dd>{slippage}%</dd>
          <dt>{isEvm ? "Fee" : "Bridging Fee"}</dt>
          <dd>$0</dd>
          <dt>Order Routing</dt>
          <dd>Skip Router</dd>
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
