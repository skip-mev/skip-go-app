import { ChevronDownIcon, PencilSquareIcon } from "@heroicons/react/16/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { RouteResponse } from "@skip-router/core";
import { clsx } from "clsx";
import { Fragment, useEffect, useMemo } from "react";

import { disclosure, useDisclosureKey } from "@/context/disclosures";
import { useSettingsStore } from "@/context/settings";
import { formatMaxFraction, formatPercent } from "@/utils/intl";

import { ConversionRate } from "../ConversionRate";
import { SimpleTooltip } from "../SimpleTooltip";
import { UsdValue } from "../UsdValue";
import { FormValues } from "./useSwapWidget";

type Props = FormValues & {
  amountOut: string;
  route: RouteResponse;
  priceImpactPercent: number;
  priceImpactThresholdReached: boolean;
};

export const SwapDetails = ({
  amountIn,
  amountOut,
  sourceChain,
  sourceAsset,
  destinationChain,
  destinationAsset,
  route,
  priceImpactPercent,
  priceImpactThresholdReached,
}: Props) => {
  const [open, control] = useDisclosureKey("swapDetailsCollapsible");

  const { gasComputed, slippage } = useSettingsStore();

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

  useEffect(() => {
    if (priceImpactThresholdReached) {
      control.open();
    }
  }, [control, priceImpactThresholdReached]);

  if (!(sourceChain && sourceAsset && destinationChain && destinationAsset)) {
    return null;
  }

  const isEvm = sourceChain?.chainType === "evm" || destinationChain?.chainType === "evm";

  return (
    <Collapsible.Root
      className={clsx(
        "group rounded-lg px-4 py-2 text-sm",
        "border border-neutral-200 transition-[border,shadow]",
        "hover:border-neutral-300 hover:shadow-sm",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
      )}
      open={open}
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
          className={clsx(
            "relative flex items-center gap-1 text-xs",
            "before:absolute before:-inset-2 before:content-['']",
            "text-neutral-400",
          )}
        >
          <span
            className={clsx(
              "animate-slide-left-and-fade tabular-nums text-neutral-400 transition-opacity",
              open && "hidden",
            )}
          >
            Slippage: {slippage}%
          </span>
          <ChevronDownIcon className={clsx("h-4 w-4 transition", open ? "rotate-180" : "rotate-0")} />
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
            "mb-2 mt-4 grid grid-cols-2 gap-2",
            "[&_dt]:text-start [&_dt]:text-neutral-400",
            "[&_dd]:text-end [&_dd]:tabular-nums",
          )}
        >
          {priceImpactPercent ? (
            <Fragment>
              <dt className={priceImpactThresholdReached ? "text-red-500" : ""}>Price Impact</dt>
              <dd className={priceImpactThresholdReached ? "text-red-500" : ""}>{formatPercent(priceImpactPercent)}</dd>
            </Fragment>
          ) : null}
          <dt>Slippage</dt>
          <dd>
            <SimpleTooltip label="Click to change maximum slippage">
              <button
                className={clsx(
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
          <dt>Gas Adjustment</dt>
          <dd>
            <SimpleTooltip label="Click to change gas adjusment">
              <button
                className={clsx(
                  "mr-1 inline-flex items-center gap-1 p-1 text-xs transition-colors",
                  "text-red-500 hover:bg-neutral-100",
                  "rounded",
                )}
                onClick={() => disclosure.open("settingsDialog")}
              >
                <PencilSquareIcon className="h-3 w-3" />
              </button>
            </SimpleTooltip>
            {gasComputed &&
              parseFloat(gasComputed).toLocaleString("en-US", {
                maximumFractionDigits: 8,
              })}
          </dd>
          <dt>Bridging Fee</dt>
          <dd>
            {formatMaxFraction(bridgingFee)} {isEvm ? "ETH" : ""}
          </dd>
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
