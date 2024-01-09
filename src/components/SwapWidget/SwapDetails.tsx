import { ChevronDownIcon, Cog6ToothIcon } from "@heroicons/react/16/solid";
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

  const { gas, slippage } = useSettingsStore();

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

  const isEvm =
    sourceChain?.chainType === "evm" || destinationChain?.chainType === "evm";

  return (
    <Collapsible.Root
      className={clsx(
        "px-4 py-2 rounded-lg text-sm group",
        "border border-neutral-200 transition-[border,shadow]",
        "hover:border-neutral-300 hover:shadow-sm",
        "focus-within:border-neutral-300 focus-within:shadow-sm",
      )}
      open={open}
      onOpenChange={control.set}
    >
      <div className="flex items-center text-center gap-1 relative text-xs">
        <ConversionRate
          srcAsset={sourceAsset}
          destAsset={destinationAsset}
          amountIn={amountIn}
          amountOut={amountOut}
        >
          {({ left, right, conversion, toggle }) => (
            <div>
              <button className="mr-2 tabular-nums" onClick={toggle}>
                1 {(left.symbol ?? "").replace(/\sEthereum$/, "")} ={" "}
                {conversion.toLocaleString("en-US", {
                  maximumFractionDigits: 4,
                })}{" "}
                {(right.symbol ?? "").replace(/\sEthereum$/, "")}
              </button>
              <span className="text-neutral-400 tabular-nums">
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
            "flex items-center text-xs relative gap-1",
            "before:absolute before:-inset-2 before:content-['']",
            "text-neutral-400",
          )}
        >
          <span
            className={clsx(
              "text-neutral-400 tabular-nums transition-opacity animate-slide-left-and-fade",
              open && "hidden",
            )}
          >
            Slippage: {slippage}%
          </span>
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
          {priceImpactPercent ? (
            <Fragment>
              <dt className={priceImpactThresholdReached ? "text-red-500" : ""}>
                Price Impact
              </dt>
              <dd className={priceImpactThresholdReached ? "text-red-500" : ""}>
                {formatPercent(priceImpactPercent)}
              </dd>
            </Fragment>
          ) : null}
          <dt>Slippage</dt>
          <dd>
            <SimpleTooltip label="Click to change maximum slippage">
              <button
                className={clsx(
                  "p-1 text-xs inline-flex items-center gap-1 transition-colors mr-1",
                  "text-neutral-500 bg-neutral-100 hover:bg-neutral-200",
                  "rounded",
                )}
                onClick={() => disclosure.open("settingsDialog")}
              >
                <Cog6ToothIcon className="w-2.5 h-2.5" />
              </button>
            </SimpleTooltip>
            {slippage}%
          </dd>
          <dt>Gas Adjustment</dt>
          <dd>
            <SimpleTooltip label="Click to change gas adjusment">
              <button
                className={clsx(
                  "p-1 text-xs inline-flex items-center gap-1 transition-colors mr-1",
                  "text-neutral-500 bg-neutral-100 hover:bg-neutral-200",
                  "rounded",
                )}
                onClick={() => disclosure.open("settingsDialog")}
              >
                <Cog6ToothIcon className="w-2.5 h-2.5" />
              </button>
            </SimpleTooltip>
            {gas}
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
