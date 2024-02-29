import { ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { BridgeType, RouteResponse } from "@skip-router/core";
import { useMemo } from "react";

import { disclosure, useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { formatPercent, formatUSD } from "@/utils/intl";
import { cn } from "@/utils/ui";

import { ConversionRate } from "../ConversionRate";
import { SimpleTooltip } from "../SimpleTooltip";
import { UsdValue } from "../UsdValue";
import { SwapWidgetStore } from "./useSwapWidget";

type Props = SwapWidgetStore & {
  amountOut: string;
  onBridgesChange: (bridges: BridgeType[]) => void;
  priceImpactPercent: number;
  priceImpactThresholdReached: boolean;
  route: RouteResponse;
};

export const SwapDetails = ({
  amountIn,
  amountOut,
  // bridges: selectedBridges,
  destinationAsset,
  destinationChain,
  gasRequired,
  // onBridgesChange,
  priceImpactPercent,
  priceImpactThresholdReached,
  route,
  sourceAsset,
  sourceChain,
  sourceFeeAsset,
}: Props) => {
  const [open, control] = useDisclosureKey("swapDetailsCollapsible");

  const { slippage } = useSettingsStore();

  const axelarTransferOperation = useMemo(() => {
    for (const op of route.operations) {
      if ("axelarTransfer" in op) return op;
    }
  }, [route]);

  const bridgingFee = useMemo(() => {
    if (!axelarTransferOperation) return;
    const { feeAmount, feeAsset, usdFeeAmount } = axelarTransferOperation.axelarTransfer;
    const computed = (+feeAmount / Math.pow(10, feeAsset.decimals || 18)).toLocaleString("en-US", {
      maximumFractionDigits: 6,
    });

    return { inAsset: `${computed} ${feeAsset.symbol}`, inUSD: `${formatUSD(usdFeeAmount)}` };
  }, [axelarTransferOperation]);

  if (!(sourceChain && sourceAsset && destinationChain && destinationAsset)) {
    return null;
  }

  return (
    <Collapsible.Root
      className={cn(
        "group rounded-lg px-4 py-2 text-sm",
        "border border-neutral-200 transition-[border,shadow]",
        "hover:border-neutral-300 hover:shadow-sm",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
      )}
      open={open || priceImpactThresholdReached}
      onOpenChange={control.set}
    >
      <div className="relative flex items-center gap-1 text-center text-xs">
        <ConversionRate
          srcAsset={sourceAsset}
          destAsset={destinationAsset}
          amountIn={amountIn}
          amountOut={amountOut}
        >
          {({ left, right, conversion, toggle }) => (
            <div>
              <button
                className="mr-2 tabular-nums"
                onClick={toggle}
              >
                1 {(left.recommendedSymbol ?? "").replace(/\sEthereum$/, "")} ={" "}
                {conversion.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })}{" "}
                {(right.recommendedSymbol ?? "").replace(/\sEthereum$/, "")}
              </button>
              <span className="tabular-nums text-neutral-400">
                <UsdValue
                  error={null}
                  chainId={right.chainID}
                  denom={right.denom}
                  coingeckoID={right.coingeckoID}
                  value={conversion.toString()}
                />
              </span>
            </div>
          )}
        </ConversionRate>
        <div className="flex-grow" />
        <Collapsible.Trigger
          className={cn(
            "relative flex items-center gap-1 text-xs",
            "before:absolute before:-inset-2 before:content-['']",
            "text-neutral-400",
          )}
        >
          <span
            className={cn(
              "animate-slide-left-and-fade tabular-nums text-neutral-400 transition-opacity",
              open && "hidden",
            )}
          >
            Slippage: {slippage}%
          </span>
          <ChevronDownIcon className={cn("h-4 w-4 transition", open ? "rotate-180" : "rotate-0")} />
        </Collapsible.Trigger>
      </div>

      <Collapsible.Content
        className={cn(
          "overflow-hidden",
          "data-[state=open]:animate-collapsible-open",
          "data-[state=closed]:animate-collapsible-closed",
        )}
      >
        <dl
          className={cn(
            "mb-2 mt-4 grid grid-cols-2 gap-2",
            "[&_dt]:text-start [&_dt]:text-neutral-400",
            "[&_dd]:text-end [&_dd]:tabular-nums",
          )}
        >
          {priceImpactPercent ? (
            <>
              <dt className={priceImpactThresholdReached ? "text-red-500" : ""}>Price Impact</dt>
              <dd className={priceImpactThresholdReached ? "text-red-500" : ""}>{formatPercent(priceImpactPercent)}</dd>
            </>
          ) : null}
          <dt>Slippage</dt>
          <dd>
            <SimpleTooltip label="Click to change maximum slippage">
              <button
                className={cn(
                  "mr-1 inline-flex items-center gap-1 p-1 text-xs transition-colors",
                  "text-red-500 hover:bg-neutral-100",
                  "rounded",
                )}
                onClick={() => disclosure.open("settingsDialog")}
              >
                <PencilSquareIcon className="h-3 w-3" />
              </button>
            </SimpleTooltip>
            {slippage}%
          </dd>
          {sourceFeeAsset && (
            <>
              <dt>Estimated Transaction Fee</dt>
              <dd>
                {gasRequired ?? "-"} {sourceFeeAsset.recommendedSymbol}
              </dd>
            </>
          )}
          {/* <dt>Gas Amount</dt>
          <dd>
            <SimpleTooltip label="Click to change gas multiplier">
              <button
                className={cn(
                  "mr-1 inline-flex items-center gap-1 p-1 text-xs transition-colors",
                  "text-red-500 hover:bg-neutral-100",
                  "rounded",
                )}
                onClick={() => disclosure.open("settingsDialog")}
              >
                <PencilSquareIcon className="h-3 w-3" />
              </button>
            </SimpleTooltip>
            {parseFloat(gasAmount).toLocaleString()}
          </dd> */}
          <dt>Bridging Fee</dt>
          <dd>
            {bridgingFee?.inAsset ?? "-"}{" "}
            <span className="text-sm tabular-nums text-neutral-400">{bridgingFee?.inUSD ?? "-"}</span>
          </dd>
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
