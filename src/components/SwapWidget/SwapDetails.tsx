import { ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/20/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { useMemo } from "react";

import { disclosure, useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";

import { SimpleTooltip } from "../SimpleTooltip";
import { UsdValue } from "../UsdValue";
import { FormValues } from "./useSwapWidget";

type Props = FormValues & {
  amountOut: string;
  route: RouteResponse;
};

export const SwapDetails = ({
  amountIn,
  amountOut,
  sourceChain,
  sourceAsset,
  destinationChain,
  destinationAsset,
  route,
}: Props) => {
  const [open, control] = useDisclosureKey("swapDetailsCollapsible");

  const { slippage } = useSettingsStore();

  const axelarTransferOperation = useMemo(() => {
    for (const op of route.operations) {
      if ("axelarTransfer" in op) return op;
    }
    return null;
  }, [route]);

  const bridgingFee = useMemo(() => {
    if (!axelarTransferOperation) return 0;
    const { feeAmount } = axelarTransferOperation.axelarTransfer;
    return +feeAmount / Math.pow(10, 18);
  }, [axelarTransferOperation]);

  if (!(sourceChain && sourceAsset && destinationChain && destinationAsset)) {
    return null;
  }

  const isEvm =
    sourceChain?.chainType === "evm" || destinationChain?.chainType === "evm";

  return (
    <Collapsible.Root
      className="border border-neutral-200 px-4 py-2 rounded-lg text-sm group"
      open={open}
      onOpenChange={control.set}
    >
      <div className="flex items-center text-center gap-1 relative text-xs">
        <div>
          <span className="mr-1">
            1 {destinationAsset.symbol} = {(+amountIn / +amountOut).toFixed(4)}{" "}
            {sourceAsset.symbol}
          </span>
          <span className="text-neutral-400 tabular-nums before:content-['('] after:content-[')']">
            <UsdValue
              chainId={sourceAsset.chainID}
              denom={sourceAsset.denom}
              coingeckoId={sourceAsset.coingeckoId}
              value={(+amountIn / +amountOut).toString()}
            />
          </span>
        </div>
        <div className="flex-grow" />
        <Collapsible.Trigger
          className={clsx(
            "flex items-center text-xs text-neutral-400 relative",
            "before:absolute before:-inset-2 before:content-['']",
          )}
        >
          <ChevronDownIcon
            className={clsx(
              "w-4 h-4 transition",
              open ? "rotate-180" : "rotate-0",
            )}
          />
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content
        className={clsx(
          "overflow-hidden",
          "data-[state=open]:animate-collapsible-open",
          "data-[state=closed]:animate-collapsible-closed",
        )}
      >
        <dl
          className={clsx(
            "grid grid-cols-2 gap-2 mt-4 mb-2",
            "[&_dt]:text-neutral-400 [&_dt]:text-start",
            "[&_dd]:text-end [&_dd]:tabular-nums",
          )}
        >
          <dt>
            Max Slippage{" "}
            <SimpleTooltip label="Click to change max slippage">
              <button
                className="relative before:absolute before:-inset-2"
                onClick={() => disclosure.open("settingsDialog")}
              >
                <PencilSquareIcon className="w-3 h-3 -mb-px" />
              </button>
            </SimpleTooltip>
          </dt>
          <dd>{slippage}%</dd>
          <dt>Bridging Fee</dt>
          <dd>
            <SimpleTooltip
              label={
                axelarTransferOperation
                  ? `${axelarTransferOperation.axelarTransfer.feeAmount} gwei`
                  : ""
              }
              delayDuration={0}
              enabled={!!axelarTransferOperation}
            >
              <span
                className={
                  axelarTransferOperation
                    ? "underline decoration-dotted underline-offset-4 cursor-help decoration-neutral-400"
                    : ""
                }
              >
                {format(bridgingFee)} {isEvm ? "ETH" : ""}
              </span>
            </SimpleTooltip>
          </dd>
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};

const { format } = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 8,
});
