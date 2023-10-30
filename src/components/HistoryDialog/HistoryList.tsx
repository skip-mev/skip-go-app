import {
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ChevronDownIcon,
  EyeIcon,
  TrashIcon,
} from "@heroicons/react/20/solid";
import * as Accordion from "@radix-ui/react-accordion";
import { clsx } from "clsx";
import { forwardRef, Fragment } from "react";

import { disclosure } from "@/context/disclosures";
import { removeTxHistory, TxHistoryItem } from "@/context/tx-history";

import { AssetValue } from "../AssetValue";
import { ChainSymbol } from "../ChainSymbol";
import * as DescriptionList from "./DescriptionList";
import { RenderDate } from "./RenderDate";

type RootProps = Omit<Accordion.AccordionSingleProps, "type">;

export const Root = forwardRef<HTMLDivElement, RootProps>(
  function Root(props, ref) {
    return (
      <Accordion.Root
        className={clsx("py-2 space-y-2 flex flex-col items-stretch")}
        collapsible
        type="single"
        {...props}
        ref={ref}
      />
    );
  },
);

type ItemProps = Omit<Accordion.AccordionItemProps, "value"> & {
  id: string;
  data: TxHistoryItem;
};

export const Item = forwardRef<HTMLDivElement, ItemProps>(
  function Item(props, ref) {
    const { id, data, className, ...rest } = props;

    return (
      <Accordion.Item
        className={clsx(
          "p-1",
          "border border-neutral-200 rounded-lg transition-all",
          "data-[state=open]:shadow-md",
          "data-[state=open]:p-2 data-[state=open]:-mx-1",
          className,
        )}
        value={id}
        {...rest}
        ref={ref}
      >
        <Accordion.Header
          className={clsx(
            "flex flex-col items-stretch space-y-2 relative",
            "rounded-md hover:bg-gray-100 p-2 transition-colors",
          )}
        >
          <div className="flex items-center space-x-4 text-start">
            <time className="uppercase text-center text-sm opacity-60 tabular-nums">
              <RenderDate date={data.timestamp} />
            </time>
            <div className="flex-grow">
              <div className="font-medium text-sm flex items-center space-x-1">
                <ChainSymbol chainId={data.route.sourceAssetChainID} />
                <ArrowRightIcon className="w-4 h-4" />
                <ChainSymbol chainId={data.route.destAssetChainID} />
              </div>
              <div className="opacity-60 text-sm flex items-center space-x-1">
                <AssetValue
                  chainId={data.route.sourceAssetChainID}
                  denom={data.route.sourceAssetDenom}
                  value={data.route.amountIn}
                />
                <ArrowRightIcon className="w-3 h-3" />
                <AssetValue
                  chainId={data.route.destAssetChainID}
                  denom={data.route.destAssetDenom}
                  value={data.route.amountOut}
                />
              </div>
            </div>
            <div
              className={clsx("text-sm", {
                "text-green-600": data.status === "success",
                "text-gray-600": data.status === "pending",
                "text-red-600": data.status === "failed",
              })}
            >
              {data.status === "success" && "Done ✅"}
              {data.status === "pending" && "Pending ⏳"}
              {data.status === "failed" && "Failed ❌"}
            </div>
          </div>

          <Accordion.Trigger
            className={clsx(
              "flex items-center text-xs text-black/60 justify-center self-center outline-none group",
              "HistoryListTrigger hover:underline",
              "before:absolute before:content-[''] before:inset-0",
            )}
          >
            <span className="HistoryListTriggerText" />
            <ChevronDownIcon
              className={clsx(
                "w-4 h-4",
                "transition-transform group-data-[state=open]:rotate-180",
              )}
              aria-hidden
            />
          </Accordion.Trigger>
        </Accordion.Header>

        <Accordion.Content
          className={clsx(
            "overflow-hidden space-y-2",
            "data-[state=open]:animate-accordion-open",
            "data-[state=closed]:animate-accordion-closed",
          )}
        >
          <DescriptionList.Root className="pt-2">
            <DescriptionList.Row>
              <DescriptionList.Dt>Chain Route</DescriptionList.Dt>
              <DescriptionList.Dd className="flex flex-wrap items-center space-x-1">
                {data.route.chainIDs.map((chainId, i) => (
                  <Fragment key={i}>
                    {i > 0 && <ArrowRightIcon className="w-4 h-4" />}
                    <ChainSymbol chainId={chainId} />
                  </Fragment>
                ))}
              </DescriptionList.Dd>
            </DescriptionList.Row>
            {data.txStatus.map((stat, i) => (
              <DescriptionList.Row key={i}>
                <DescriptionList.Dt className="tabular-nums">
                  Transaction {i + 1}
                </DescriptionList.Dt>
                <DescriptionList.Dd>
                  <a
                    href={stat.explorerLink}
                    target="_blank"
                    className="flex items-center space-x-px hover:underline"
                  >
                    <span className="truncate tabular-nums max-w-[24ch]">
                      {stat.txHash}
                    </span>
                    <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                  </a>
                </DescriptionList.Dd>
              </DescriptionList.Row>
            ))}
          </DescriptionList.Root>
          <div className="flex space-x-1">
            <button
              className={clsx(
                "text-xs px-2 py-1 border rounded-md bg-gray-100 hover:bg-gray-200 transition-colors",
                "flex items-center justify-center space-x-1 flex-grow",
              )}
              onClick={() => {
                disclosure.openJson({ title: "Tx History JSON", data });
              }}
            >
              <EyeIcon className="w-3 h-3" />
              <span>View Raw Route</span>
            </button>
            <button
              className={clsx(
                "text-xs px-2 py-1 rounded-md transition-colors",
                "flex items-center justify-center space-x-1",
                "text-[#FF486E] bg-[#FF486E]/20 hover:bg-[#FF486E]/30",
              )}
              onClick={() => removeTxHistory(id)}
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        </Accordion.Content>
      </Accordion.Item>
    );
  },
);
