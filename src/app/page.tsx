/* eslint-disable @next/next/no-img-element */
"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Chain, IBCAddress, IBCHop, getTransferMsgs } from "@/solve/api";
import NavBar from "@/components/NavBar";
import SolveForm, {
  DEFAULT_DESTINATION_CHAIN_ID,
  DEFAULT_SOURCE_CHAIN_ID,
  SolveFormValues,
} from "@/components/SolveForm";
import PathDisplay from "@/components/PathDisplay";
import * as Accordion from "@radix-ui/react-accordion";
import { useChainAssets, useSolveChains, useSolveRoute } from "@/solve/queries";
import { Asset } from "@/components/AssetSelect";
import { useManager } from "@cosmos-kit/react";
import { ChainRecord } from "@cosmos-kit/core";
import { chainNameToChainlistURL } from "@/config";
import axios from "axios";
import {
  getFeeDenomsForChainID,
  getSigningStargateClientForChainID,
  getStargateClientForChainID,
} from "@/utils/utils";
import { ethers } from "ethers";
import Long from "long";
import { GasPrice } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Transaction {
  status: "init" | "pending" | "success" | "error";
  actions: Action[];
}

interface Action {
  type: "transfer" | "swap";
  sourceChain: string;
  destinationChain: string;
  asset: Asset;
}

function getRouteMetadata(
  asset: Asset,
  srcChain: Chain,
  destChain: Chain,
  route: IBCHop[]
) {
  const batches = [];

  let batch: IBCHop[] = [];

  route.forEach((hop, i) => {
    if (!hop.pfmEnabled && batch.length > 0) {
      batches.push(batch);
      batch = [];
    }

    batch.push(hop);
  });

  batches.push(batch);

  const transactions = [];

  for (let i = 0; i < batches.length; i++) {
    const transaction: Transaction = {
      status: "init",
      actions: [],
    };

    const batch = batches[i];

    for (let j = 0; j < batch.length; j++) {
      const hop = batch[j];

      let hopDestination = destChain.chainId;
      if (j < batch.length - 1) {
        hopDestination = batch[j + 1].chainId;
      } else if (i < batches.length - 1) {
        hopDestination = batches[i + 1][0].chainId;
      }

      transaction.actions.push({
        type: "transfer",
        sourceChain: hop.chainId,
        destinationChain: hopDestination,
        asset,
      });
    }

    transactions.push(transaction);
  }

  return transactions;
}

export default function Home() {
  const [txPending, setTxPending] = useState(false);
  const [formState, setFormState] = useState<SolveFormValues>({
    amount: "",
    destinationAssetOverride: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const { data: supportedChains } = useSolveChains();

  const { chainRecords } = useManager();

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

  const { data: assets } = useChainAssets(formState.sourceChain?.chainName);

  useEffect(() => {
    if (assets && assets.length > 0 && !formState.asset) {
      setFormState({
        ...formState,
        asset: assets[0],
      });
    }
  }, [assets, formState]);

  const { data: solveRoute, status: solveRouteStatus } = useSolveRoute(
    formState.asset?.denom ?? "",
    formState.sourceChain?.chainId ?? "",
    "",
    formState.destinationChain?.chainId ?? ""
  );

  const routeChainIDs = useMemo(() => {
    if (!formState.sourceChain || !formState.destinationChain) {
      return [];
    }

    if (!solveRoute || solveRoute.length === 0) {
      return [
        formState.sourceChain.chainId,
        formState.destinationChain.chainId,
      ];
    }

    const IDs = solveRoute.map((hop) => hop.chainId);

    if (formState.destinationChain) {
      IDs.push(formState.destinationChain.chainId);
    }

    return IDs;
  }, [formState.sourceChain, formState.destinationChain, solveRoute]);

  const noPathExists =
    (solveRouteStatus === "success" && !solveRoute) ||
    solveRoute?.length === 0 ||
    solveRouteStatus === "error";

  // const routeMetadata = useMemo(() => {
  //   if (
  //     !formState.sourceChain ||
  //     !formState.destinationChain ||
  //     !formState.asset
  //   ) {
  //     return [];
  //   }

  //   if (!solveRoute || solveRoute.length === 0) {
  //     return [];
  //   }

  //   return getRouteMetadata(
  //     formState.asset,
  //     formState.sourceChain,
  //     formState.destinationChain,
  //     solveRoute
  //   );
  // }, [
  //   formState.sourceChain,
  //   formState.destinationChain,
  //   formState.asset,
  //   solveRoute,
  // ]);

  const [routeMetadata, setRouteMetadata] = useState<Transaction[]>([]);
  const [txStatus, setTxStatus] = useState<string[]>([]);

  useEffect(() => {
    if (
      !formState.sourceChain ||
      !formState.destinationChain ||
      !formState.asset
    ) {
      return;
    }

    if (!solveRoute || solveRoute.length === 0) {
      return;
    }

    const metadata = getRouteMetadata(
      formState.asset,
      formState.sourceChain,
      formState.destinationChain,
      solveRoute
    );

    setRouteMetadata(metadata);
  }, [
    formState.asset,
    formState.destinationChain,
    formState.sourceChain,
    solveRoute,
  ]);

  const handleSubmit = useCallback(async () => {
    if (!window.keplr) {
      // TODO: should probably show error, although I don't think this point can be reached
      return;
    }

    if (
      !formState.sourceChain ||
      !formState.destinationChain ||
      !formState.asset
    ) {
      return;
    }

    if (!solveRoute) {
      return;
    }

    setTxPending(true);

    try {
      // 1. add any unknown chains to wallet
      const chainInfos = await window.keplr.getChainInfosWithoutEndpoints();

      for (const chainID of routeChainIDs) {
        if (chainInfos.findIndex((chain) => chain.chainId === chainID) == -1) {
          const record = chainRecords.find(
            (record) => record.chain.chain_id === chainID
          );

          if (record) {
            const chainInfo = await axios.get(
              `https://raw.githubusercontent.com/chainapsis/keplr-chain-registry/main/cosmos/${record.name}.json`
            );

            await window.keplr.experimentalSuggestChain(chainInfo.data);
          }
        }
      }

      // 2. connect wallet to all chains in route
      await window.keplr.enable(routeChainIDs);

      // 3. get transfer messages from api
      const userAddresses: Record<string, IBCAddress> = {};

      for (const chainID of routeChainIDs) {
        const signer = window.keplr.getOfflineSigner(chainID);
        const accounts = await signer.getAccounts();

        userAddresses[chainID] = {
          address: accounts[0].address,
          chainId: chainID,
        };
      }

      const messages = await getTransferMsgs(
        ethers
          .parseUnits(formState.amount, formState.asset.decimals)
          .toString(),
        {
          denom: formState.asset.denom,
          chainId: formState.sourceChain.chainId,
        },
        formState.destinationChain.chainId,
        solveRoute,
        Object.values(userAddresses)
      );

      // 3. check balances on chains where a tx is initiated
      for (const multiHopMsg of messages) {
        const addr = userAddresses[multiHopMsg.chainId].address;

        const client = await getStargateClientForChainID(multiHopMsg.chainId);

        const feeDenoms = await getFeeDenomsForChainID(multiHopMsg.chainId);

        const feeDenom = feeDenoms[0];

        if (!feeDenom) {
          throw new Error("no fee denom found");
        }

        if (!feeDenom.average_gas_price) {
          throw new Error("no average gas price found");
        }

        const amountNeeded = feeDenom.average_gas_price * 200000;

        const feeDenomBalance = await client.getBalance(addr, feeDenom.denom);

        if (parseInt(feeDenomBalance.amount) < amountNeeded) {
          throw new Error(
            `Insufficient fee token to initiate transfer on ${multiHopMsg.chainId}. Need ${amountNeeded} ${feeDenom.denom}, but only have ${feeDenomBalance.amount} ${feeDenom.denom}.`
          );
        }
      }

      // 4. sign and broadcast txs
      for (const multiHopMsg of messages) {
        const msgIdx = messages.indexOf(multiHopMsg);

        setRouteMetadata((prev) =>
          prev.map((metadata, i) => {
            if (i === msgIdx) {
              return {
                ...metadata,
                status: "pending",
              };
            }
            return metadata;
          })
        );

        const decodedMsg = JSON.parse(multiHopMsg.msg);

        const key = await window.keplr.getKey(multiHopMsg.chainId);

        let signer: OfflineSigner;
        if (key.isNanoLedger) {
          signer = window.keplr.getOfflineSignerOnlyAmino(multiHopMsg.chainId);
        } else {
          signer = window.keplr.getOfflineSigner(multiHopMsg.chainId);
        }

        const feeDenoms = await getFeeDenomsForChainID(multiHopMsg.chainId);
        const feeDenom = feeDenoms[0];

        if (!feeDenom) {
          throw new Error("no fee denom found");
        }

        if (!feeDenom.average_gas_price) {
          throw new Error("no average gas price found");
        }

        const client = await getSigningStargateClientForChainID(
          multiHopMsg.chainId,
          signer,
          {
            gasPrice: GasPrice.fromString(
              `${feeDenom.average_gas_price}${feeDenom.denom}`
            ),
          }
        );

        const currentHeight = await client.getHeight();

        const msg = {
          typeUrl: multiHopMsg.msgTypeUrl,
          value: {
            sender: decodedMsg.sender,
            receiver: decodedMsg.receiver,
            sourceChannel: decodedMsg.source_channel,
            sourcePort: decodedMsg.source_port,
            token: decodedMsg.token,
            timeoutHeight: {
              revisionHeight: Long.fromNumber(currentHeight).add(100),
              revisionNumber: Long.fromNumber(currentHeight).add(100),
            },
            timeoutTimestamp: Long.fromNumber(0),
            memo: decodedMsg.memo,
          },
        };

        try {
          await client.signAndBroadcast(decodedMsg.sender, [msg], "auto");

          const destinationChainID =
            multiHopMsg.path[multiHopMsg.path.length - 1];

          const destinationChainClient = await getStargateClientForChainID(
            destinationChainID
          );
          const destinationChainAddress =
            userAddresses[destinationChainID].address;

          const denomOut: string =
            msgIdx === messages.length - 1
              ? solveRoute[solveRoute.length - 1].destDenom
              : JSON.parse(messages[msgIdx + 1].msg).token.denom;

          const balanceBefore = await destinationChainClient.getBalance(
            destinationChainAddress,
            denomOut
          );

          while (true) {
            console.log("polling...");

            const balance = await destinationChainClient.getBalance(
              destinationChainAddress,
              denomOut
            );

            if (parseInt(balance.amount) > parseInt(balanceBefore.amount)) {
              break;
            }

            await wait(1000);
          }

          setRouteMetadata((prev) =>
            prev.map((metadata, i) => {
              if (i === msgIdx) {
                return {
                  ...metadata,
                  status: "success",
                };
              }

              return metadata;
            })
          );
        } catch (e) {
          if (e instanceof Error) {
            if (e.message === "Request rejected") {
              setRouteMetadata((prev) =>
                prev.map((metadata, i) => {
                  if (i === msgIdx) {
                    return {
                      ...metadata,
                      status: "init",
                    };
                  }
                  return metadata;
                })
              );

              break;
            }

            setErrorMessage(e.message);
          } else {
            setErrorMessage("Unknown error, please try again");
            // console.log("---");
            // console.log(e);
            // console.log("---");
          }
        }
      }
    } catch (e: any) {
      console.log("error");
      console.log(e);
      setErrorMessage(e.message);
    } finally {
      setTxPending(false);
    }
  }, [
    chainRecords,
    formState.amount,
    formState.asset,
    formState.destinationChain,
    formState.sourceChain,
    routeChainIDs,
    solveRoute,
  ]);

  if (
    !formState.sourceChain ||
    !formState.destinationChain ||
    !formState.asset
  ) {
    return null;
  }

  return (
    <Fragment>
      <NavBar chainID={formState.sourceChain.chainId} />
      <main className="px-4 pt-4 pb-24">
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="flex gap-6">
            <div className="w-full max-w-xl space-y-4">
              <SolveForm
                onChange={(newFormState) => setFormState(newFormState)}
                values={formState}
                onSubmit={handleSubmit}
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
                <div className="space-y-6">
                  <PathDisplay
                    chainIDs={routeChainIDs}
                    asset={formState.asset}
                    loading={solveRouteStatus === "loading"}
                  />
                  {routeMetadata.length > 0 && (
                    <div className="bg-indigo-400/10 border border-indigo-400/30 text-indigo-400 text-sm font-medium text-center rounded py-2">
                      {routeMetadata.length === 1 && (
                        <p>
                          This route can be completed in a single transaction
                        </p>
                      )}
                      {routeMetadata.length > 1 && (
                        <p>
                          This route requires{" "}
                          <span className="font-bold">
                            {routeMetadata.length} transactions
                          </span>{" "}
                          to complete
                        </p>
                      )}
                    </div>
                  )}
                  {noPathExists && (
                    <div className="bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-medium text-center rounded py-2">
                      <p>No Path Found</p>
                    </div>
                  )}
                  <div>
                    <Accordion.Root className="AccordionRoot" type="multiple">
                      {routeMetadata.map((tx, i) => {
                        return (
                          <Accordion.Item key={i} value={`item-${i}`}>
                            <Accordion.Trigger className="font-bold text-sm hover:underline flex items-center justify-between w-full border-b border-zinc-600 py-4">
                              <div className="flex items-center gap-2">
                                {tx.status === "pending" && (
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
                                {tx.status === "init" && (
                                  <div className="w-5 h-5 border-2 border-zinc-500 rounded-full" />
                                )}
                                {tx.status === "success" && (
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
                                {/*  */}
                                <span>Transaction {i + 1}</span>
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
                              {tx.actions.map((action, j) => {
                                const actionStart = chainRecords.find(
                                  (record) =>
                                    record.chain.chain_id === action.sourceChain
                                ) as ChainRecord;
                                const actionEnd = chainRecords.find(
                                  (record) =>
                                    record.chain.chain_id ===
                                    action.destinationChain
                                ) as ChainRecord;
                                return (
                                  <div
                                    className="py-4"
                                    key={`action-${i}-${j}`}
                                  >
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
                                          src={`https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${action.asset.image}`}
                                          alt=""
                                        />{" "}
                                        <span className="font-bold text-white">
                                          {action.asset.symbol}
                                        </span>{" "}
                                        from{" "}
                                        <img
                                          alt={actionStart.chain.pretty_name}
                                          src={`${chainNameToChainlistURL(
                                            actionStart.name
                                          )}/chainImg/_chainImg.svg`}
                                          className="w-5 h-5 inline-block"
                                          onError={(error) => {
                                            error.currentTarget.src =
                                              "https://api.dicebear.com/6.x/shapes/svg";
                                          }}
                                        />{" "}
                                        <span className="font-bold text-white">
                                          {actionStart.chain.pretty_name}
                                        </span>{" "}
                                        to{" "}
                                        <img
                                          alt={actionEnd.chain.pretty_name}
                                          src={`${chainNameToChainlistURL(
                                            actionEnd.name
                                          )}/chainImg/_chainImg.svg`}
                                          className="w-5 h-5 inline-block"
                                          onError={(error) => {
                                            error.currentTarget.src =
                                              "https://api.dicebear.com/6.x/shapes/svg";
                                          }}
                                        />{" "}
                                        <span className="font-bold text-white">
                                          {actionEnd.chain.pretty_name}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </Accordion.Content>
                          </Accordion.Item>
                        );
                      })}
                    </Accordion.Root>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </Fragment>
  );
}
