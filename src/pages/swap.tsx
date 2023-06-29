/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useMemo, useState } from "react";
import {
  useChainAssets,
  useSolveChains,
  useSwapMessages,
  useSwapRoute,
} from "@/solve/queries";
import SwapForm, { SwapFormValues } from "@/components/SwapForm";
import PathDisplay from "@/components/PathDisplay";
import { Asset } from "@/components/AssetSelect";
import { ethers } from "ethers";
import {
  SwapMsgsRequest,
  SwapRouteResponse,
  getSwapMessages,
} from "@/solve/api";
import * as Accordion from "@radix-ui/react-accordion";
import {
  getAddressForChain,
  getChainByID,
  getSigningCosmWasmClientForChainID,
  getSigningStargateClientForChainID,
  getStargateClientForChainID,
} from "@/utils/utils";
import { SWAP_VENUES, chainNameToChainlistURL } from "@/config";
import { EncodeObject, OfflineSigner, coin } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DEFAULT_SOURCE_CHAIN_ID = "osmosis-1";
const DEFAULT_DESTINATION_CHAIN_ID = "cosmoshub-4";

const IBC_TRANSFER_TYPE_URL = "/ibc.applications.transfer.v1.MsgTransfer";

async function executeSwap(route: SwapRouteResponse) {
  if (!window.keplr) {
    throw new Error("Keplr extension is not installed");
  }

  // get all chain IDs in path and connect in keplr
  const chainIDs = route.chainIds;

  await window.keplr.enable(chainIDs);

  const userAddresses: Record<string, string> = {};

  // get addresses
  for (const chainID of chainIDs) {
    const address = await getAddressForChain(chainID);
    userAddresses[chainID] = address;
  }

  const data: SwapMsgsRequest = {
    preSwapHops: route.preSwapHops,
    postSwapHops: route.postSwapHops,

    chainIdsToAddresses: userAddresses,

    sourceAsset: route.sourceAsset,
    destAsset: route.destAsset,
    amountIn: route.amountIn,

    userSwap: route.userSwap,
    userSwapAmountOut: route.userSwapAmountOut,
    userSwapSlippageTolerancePercent: "5.0",

    feeSwap: route.feeSwap,
    affiliates: [],
  };

  const msgsResponse = await getSwapMessages(data);

  const sourceChain = getChainByID(route.sourceAsset.chainId);

  const feeInfo = sourceChain.fees?.fee_tokens[0];

  if (!feeInfo) {
    throw new Error("No fee info found");
  }

  const key = await window.keplr.getKey(route.sourceAsset.chainId);
  let signer: OfflineSigner;
  if (key.isNanoLedger) {
    signer = window.keplr.getOfflineSignerOnlyAmino(route.sourceAsset.chainId);
  } else {
    signer = window.keplr.getOfflineSigner(route.sourceAsset.chainId);
  }

  for (const multihopMsg of msgsResponse.requested) {
    const msgJSON = JSON.parse(multihopMsg.msg);

    let msg: EncodeObject;
    if (multihopMsg.msgTypeUrl === IBC_TRANSFER_TYPE_URL) {
      const client = await getSigningStargateClientForChainID(
        route.sourceAsset.chainId,
        signer,
        {
          gasPrice: GasPrice.fromString(
            `${feeInfo.average_gas_price}${feeInfo.denom}`
          ),
        }
      );

      msg = {
        typeUrl: multihopMsg.msgTypeUrl,
        value: {
          sourcePort: msgJSON.source_port,
          sourceChannel: msgJSON.source_channel,
          token: msgJSON.token,
          sender: msgJSON.sender,
          receiver: msgJSON.receiver,
          timeoutHeight: msgJSON.timeout_height,
          timeoutTimestamp: msgJSON.timeout_timestamp,
          memo: msgJSON.memo,
        },
      };

      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");

      console.log(tx);
    } else {
      msg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: msgJSON.sender,
          contract: msgJSON.contract,
          msg: Uint8Array.from(Buffer.from(JSON.stringify(msgJSON.msg))),
          funds: [coin(route.amountIn, route.sourceAsset.denom)],
        },
      };

      const client = await getSigningCosmWasmClientForChainID(
        route.sourceAsset.chainId,
        signer,
        {
          // @ts-ignore
          gasPrice: GasPrice.fromString(
            `${feeInfo.average_gas_price}${feeInfo.denom}`
          ),
        }
      );

      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");

      console.log(tx);
    }

    const destinationChainClient = await getStargateClientForChainID(
      route.destAsset.chainId
    );

    const destinationChainAddress = userAddresses[route.destAsset.chainId];

    const balanceBefore = await destinationChainClient.getBalance(
      destinationChainAddress,
      route.destAsset.denom
    );

    while (true) {
      console.log("polling...");

      const balance = await destinationChainClient.getBalance(
        destinationChainAddress,
        route.destAsset.denom
      );

      if (parseInt(balance.amount) > parseInt(balanceBefore.amount)) {
        break;
      }

      await wait(1000);
    }
  }

  console.log("done.");
}

function SwapPage() {
  const [txPending, setTxPending] = useState(false);
  const [txSuccess, setTxSuccess] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [formState, setFormState] = useState<SwapFormValues>({
    amountIn: "1.0",
  });

  const { data: supportedChains } = useSolveChains();

  useEffect(() => {
    if (supportedChains && !formState.sourceChain) {
      const _sourceChain =
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_SOURCE_CHAIN_ID
        ) ?? supportedChains[0];

      setFormState({
        ...formState,
        sourceChain: _sourceChain,
      });
    }

    if (supportedChains && !formState.destinationChain) {
      const _destinationChain =
        supportedChains.find(
          (chain) => chain.chainId === DEFAULT_DESTINATION_CHAIN_ID
        ) ?? supportedChains[0];

      setFormState({
        ...formState,
        destinationChain: _destinationChain,
      });
    }
  }, [formState, supportedChains]);

  const { data: sourceChainAssets } = useChainAssets(
    formState.sourceChain?.chainName
  );

  useEffect(() => {
    if (
      sourceChainAssets &&
      sourceChainAssets.length > 0 &&
      !formState.sourceAsset
    ) {
      setFormState({
        ...formState,
        sourceAsset: sourceChainAssets[0],
      });
    }
  }, [formState, sourceChainAssets]);

  const { data: destinationChainAssets } = useChainAssets(
    formState.destinationChain?.chainName
  );

  useEffect(() => {
    if (
      destinationChainAssets &&
      destinationChainAssets.length > 0 &&
      !formState.destinationAsset
    ) {
      setFormState({
        ...formState,
        destinationAsset: destinationChainAssets[0],
      });
    }
  }, [formState, destinationChainAssets]);

  const amountInFixed = useMemo(() => {
    if (!formState.sourceAsset || formState.amountIn === "") {
      return "";
    }

    try {
      return ethers
        .parseUnits(formState.amountIn, formState.sourceAsset.decimals)
        .toString();
    } catch {
      return "";
    }
  }, [formState.amountIn, formState.sourceAsset]);

  const {
    data: swapRouteResponse,
    status: swapRouteQueryStatus,
    isInitialLoading,
  } = useSwapRoute(
    amountInFixed,
    formState.sourceAsset?.denom ?? "",
    formState.sourceChain?.chainId ?? "",
    formState.destinationAsset?.denom ?? "",
    formState.destinationChain?.chainId ?? ""
  );

  const preSwapChains = useMemo(() => {
    if (!swapRouteResponse) {
      return [];
    }

    return [
      ...swapRouteResponse.preSwapHops.map((hop) => getChainByID(hop.chainId)),
      getChainByID(swapRouteResponse.userSwap.swapVenue.chainId),
    ];
  }, [swapRouteResponse]);

  const postSwapChains = useMemo(() => {
    if (!swapRouteResponse) {
      return [];
    }

    return [
      ...swapRouteResponse.postSwapHops.map((hop) => getChainByID(hop.chainId)),
      getChainByID(swapRouteResponse.destAsset.chainId),
    ];
  }, [swapRouteResponse]);

  const chainIDs = useMemo(() => {
    if (!formState.sourceChain || !formState.destinationChain) {
      return [];
    }

    if (!swapRouteResponse) {
      return [
        formState.sourceChain.chainId,
        formState.destinationChain.chainId,
      ];
    }

    return [
      ...swapRouteResponse.preSwapHops.map((hop) => hop.chainId),
      // swapRouteResponse.userSwap.swapVenue.chainId,
      ...swapRouteResponse.postSwapHops.map((hop) => hop.chainId),
      swapRouteResponse.destAsset.chainId,
    ];
  }, [formState.destinationChain, formState.sourceChain, swapRouteResponse]);

  return (
    <div className="flex gap-6">
      <div className="w-full max-w-xl space-y-4">
        <SwapForm
          onChange={(newFormState) => setFormState(newFormState)}
          values={formState}
          amountOut={swapRouteResponse?.userSwapAmountOut}
          onSubmit={async () => {
            if (!swapRouteResponse) {
              return;
            }

            setTxPending(true);

            try {
              await executeSwap(swapRouteResponse);
              setTxSuccess(true);
            } catch (e: any) {
              setErrorMessage(e.message);
            } finally {
              setTxPending(false);
            }
          }}
          txPending={txPending}
        />
        {errorMessage !== "" && (
          <div>
            <div className="rounded-md bg-red-400/10 px-2 py-2 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-400/20 text-center">
              <p>Error: {errorMessage}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="p-6">
          {formState.sourceAsset && formState.destinationAsset && (
            <div className="space-y-6">
              <PathDisplay
                assets={[
                  formState.sourceAsset as Asset,
                  formState.destinationAsset as Asset,
                ]}
                chainIDs={chainIDs}
              />
              {!swapRouteResponse && isInitialLoading && (
                <div className="bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 text-sm font-medium text-center rounded py-2">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-4 w-4 inline-block text-indigo-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
              )}
              {!swapRouteResponse && !isInitialLoading && (
                <div className="bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-medium text-center rounded py-2">
                  <p>No route found</p>
                </div>
              )}
              {swapRouteResponse && (
                <div className="bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 text-sm font-medium text-center rounded py-2">
                  <p>This route can be completed in a single transaction</p>
                </div>
              )}
              {swapRouteResponse && (
                <div>
                  <Accordion.Root className="AccordionRoot" type="multiple">
                    <Accordion.Item className="AccordionItem" value="item-0">
                      <Accordion.Trigger className="font-bold text-sm hover:underline flex items-center justify-between w-full border-b border-zinc-600 py-4">
                        <div className="flex items-center gap-2">
                          {txPending && (
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          )}
                          {!txPending && !txSuccess && (
                            <div className="w-5 h-5 border-2 border-zinc-500 rounded-full" />
                          )}
                          {!txPending && txSuccess && (
                            <div className="text-emerald-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                          <span>Transaction 1</span>
                        </div>
                        <span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </Accordion.Trigger>
                      <Accordion.Content className="py-6">
                        {swapRouteResponse?.preSwapHops.map((_, i) => {
                          const chainA = preSwapChains[i];
                          const chainB = preSwapChains[i + 1];
                          return (
                            <div className="py-4" key={`pre-swap-hop-${i}`}>
                              <div className="flex items-center gap-1.5">
                                <div className="bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 rounded-full p-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-zinc-400">
                                  <span className="font-bold text-indigo-400">
                                    Transfer
                                  </span>{" "}
                                  <img
                                    className="w-5 h-5 inline-block"
                                    src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${formState.sourceAsset?.image}`}
                                    alt=""
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {formState.sourceAsset?.symbol}
                                  </span>{" "}
                                  from{" "}
                                  <img
                                    alt={chainA.pretty_name}
                                    src={`${chainNameToChainlistURL(
                                      chainA.chain_name
                                    )}/chainImg/_chainImg.svg`}
                                    className="w-5 h-5 inline-block"
                                    onError={(error) => {
                                      error.currentTarget.src =
                                        "https://api.dicebear.com/6.x/shapes/svg";
                                    }}
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {chainA.pretty_name}
                                  </span>{" "}
                                  to{" "}
                                  <img
                                    alt={chainB.pretty_name}
                                    src={`${chainNameToChainlistURL(
                                      chainB.chain_name
                                    )}/chainImg/_chainImg.svg`}
                                    className="w-5 h-5 inline-block"
                                    onError={(error) => {
                                      error.currentTarget.src =
                                        "https://api.dicebear.com/6.x/shapes/svg";
                                    }}
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {chainB.pretty_name}
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div className="py-4">
                          <div className="flex items-center gap-1.5">
                            <div className="bg-emerald-400/10 border border-emerald-400/30 text-emerald-400 rounded-full p-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 4.5c1.215 0 2.417.055 3.604.162a.68.68 0 01.615.597c.124 1.038.208 2.088.25 3.15l-1.689-1.69a.75.75 0 00-1.06 1.061l2.999 3a.75.75 0 001.06 0l3.001-3a.75.75 0 10-1.06-1.06l-1.748 1.747a41.31 41.31 0 00-.264-3.386 2.18 2.18 0 00-1.97-1.913 41.512 41.512 0 00-7.477 0 2.18 2.18 0 00-1.969 1.913 41.16 41.16 0 00-.16 1.61.75.75 0 101.495.12c.041-.52.093-1.038.154-1.552a.68.68 0 01.615-.597A40.012 40.012 0 0110 4.5zM5.281 9.22a.75.75 0 00-1.06 0l-3.001 3a.75.75 0 101.06 1.06l1.748-1.747c.042 1.141.13 2.27.264 3.386a2.18 2.18 0 001.97 1.913 41.533 41.533 0 007.477 0 2.18 2.18 0 001.969-1.913c.064-.534.117-1.071.16-1.61a.75.75 0 10-1.495-.12c-.041.52-.093 1.037-.154 1.552a.68.68 0 01-.615.597 40.013 40.013 0 01-7.208 0 .68.68 0 01-.615-.597 39.785 39.785 0 01-.25-3.15l1.689 1.69a.75.75 0 001.06-1.061l-2.999-3z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-zinc-400">
                              <span className="font-bold text-emerald-400">
                                Swap
                              </span>{" "}
                              <img
                                className="w-5 h-5 inline-block"
                                src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${formState.sourceAsset?.image}`}
                                alt=""
                              />{" "}
                              <span className="font-bold text-white">
                                {formState.sourceAsset.symbol}
                              </span>{" "}
                              to{" "}
                              <img
                                className="w-5 h-5 inline-block"
                                src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${formState.destinationAsset?.image}`}
                                alt=""
                              />{" "}
                              <span className="font-bold text-white">
                                {formState.destinationAsset.symbol}
                              </span>{" "}
                              on{" "}
                              <img
                                className="w-5 h-5 inline-block"
                                src={
                                  SWAP_VENUES[
                                    swapRouteResponse.userSwap.swapVenue.name
                                  ].imageURL
                                }
                                alt=""
                              />{" "}
                              <span className="font-bold text-white">
                                {
                                  SWAP_VENUES[
                                    swapRouteResponse.userSwap.swapVenue
                                      .name as string
                                  ].name
                                }
                              </span>
                            </p>
                          </div>
                        </div>
                        {swapRouteResponse?.postSwapHops.map((_, i) => {
                          const chainA = postSwapChains[i];
                          const chainB = postSwapChains[i + 1];
                          return (
                            <div className="py-4" key={`pre-swap-hop-${i}`}>
                              <div className="flex items-center gap-1.5">
                                <div className="bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 rounded-full p-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                    className="w-4 h-4"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                                <p className="text-sm text-zinc-400">
                                  <span className="font-bold text-indigo-400">
                                    Transfer
                                  </span>{" "}
                                  <img
                                    className="w-5 h-5 inline-block"
                                    src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${formState.destinationAsset?.image}`}
                                    alt=""
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {formState.destinationAsset?.symbol}
                                  </span>{" "}
                                  from{" "}
                                  <img
                                    alt={chainA.pretty_name}
                                    src={`${chainNameToChainlistURL(
                                      chainA.chain_name
                                    )}/chainImg/_chainImg.svg`}
                                    className="w-5 h-5 inline-block"
                                    onError={(error) => {
                                      error.currentTarget.src =
                                        "https://api.dicebear.com/6.x/shapes/svg";
                                    }}
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {chainA.pretty_name}
                                  </span>{" "}
                                  to{" "}
                                  <img
                                    alt={chainB.pretty_name}
                                    src={`${chainNameToChainlistURL(
                                      chainB.chain_name
                                    )}/chainImg/_chainImg.svg`}
                                    className="w-5 h-5 inline-block"
                                    onError={(error) => {
                                      error.currentTarget.src =
                                        "https://api.dicebear.com/6.x/shapes/svg";
                                    }}
                                  />{" "}
                                  <span className="font-bold text-white">
                                    {chainB.pretty_name}
                                  </span>
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </Accordion.Content>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SwapPage;
