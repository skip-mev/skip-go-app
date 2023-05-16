"use client";

import { ethers } from "ethers";
import ChainSelect, { Chain } from "@/components/ChainSelect";
import AssetSelect, { Asset } from "@/components/AssetSelect";
import { Fragment, Suspense, useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useChain, useManager } from "@cosmos-kit/react";
import { WalletStatus } from "@cosmos-kit/core";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { cosmos, ibc } from "juno-network";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import {
  GasPrice,
  SigningStargateClient,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { GeneratedType, Registry } from "@cosmjs/proto-signing";

const chains = [
  {
    id: "osmosis",
    name: "Osmosis",
  },
  {
    id: "cosmos",
    name: "Cosmos Hub",
  },
  {
    id: "terra",
    name: "Terra 2.0",
  },
  {
    id: "neutron",
    name: "Neutron",
  },
  {
    id: "evmos",
    name: "Evmos",
  },
  {
    id: "axelar",
    name: "Axelar",
  },
  {
    id: "stride",
    name: "Stride",
  },
  {
    id: "quicksilver",
    name: "Quicksilver",
  },
  {
    id: "gravity-bridge",
    name: "Gravity Bridge",
  },
  {
    id: "noble",
    name: "Noble",
    chainID: "noble-1",
  },
  {
    id: "juno",
    name: "Juno",
    chainID: "juno-1",
  },
];

async function getAssets(chain: string) {
  const response = await axios.get(
    `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${chain}/assets.json`
  );
  const responseJSON = response.data;

  return responseJSON as Asset[];
}

function useAssetsQuery(chain: string) {
  return useQuery({
    queryKey: ["assets", chain],
    queryFn: () => {
      return getAssets(chain);
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

const mapChainlistIDToSolveID: Record<string, string> = {
  cosmos: "cosmoshub-4",
  osmosis: "osmosis-1",
  juno: "juno-1",
  terra: "phoenix-1",
  neutron: "neutron-1",
  evmos: "evmos_9001-2",
};

interface IBCHop {
  port: string;
  channel: string;
  chainId: string;
}

interface SolveRouteResponse {
  route: IBCHop[];
}

function useSolveRouteQuery(
  sourceChain: string,
  destinationChain: string,
  asset: Asset | null
) {
  return useQuery({
    queryKey: [
      "solveRoute",
      asset ? asset.denom : "null",
      sourceChain,
      destinationChain,
    ],
    queryFn: async () => {
      if (!asset) {
        return undefined;
      }

      const destinationChainAssets = await getAssets(destinationChain);

      // this is probably a bad assumption to make
      let maybeMatchingAsset = destinationChainAssets.find(
        (otherAsset) => otherAsset.symbol === asset?.symbol
      );

      if (!maybeMatchingAsset) {
        return undefined;
      }

      // https://solve-testnet.skip.money

      const response = await axios.get(
        `https://solve-testnet.skip.money/v1/ibc/route?source_token=${
          asset.denom
        }&source_chain_id=${
          mapChainlistIDToSolveID[sourceChain] ?? sourceChain
        }&destination_token=${maybeMatchingAsset.denom}&destination_chain_id=${
          mapChainlistIDToSolveID[destinationChain] ?? destinationChain
        }`
      );

      if (response.status !== 200) {
        return null;
      }

      return response.data as SolveRouteResponse;
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!asset,
  });
}

export default function Home() {
  const [selectedChains, setSelectedChains] = useState({
    sourceChain: {
      id: "osmosis",
      name: "Osmosis",
    },
    targetChain: {
      id: "juno",
      name: "Juno",
    },
  });

  const {
    address,
    status,
    connect: connectWallet,
    getStargateClient,
    getCosmWasmClient,
    getSigningStargateClient,
    ...rest
  } = useChain(
    selectedChains.sourceChain.id === "cosmos"
      ? "cosmoshub"
      : selectedChains.sourceChain.id
  );

  const { chainRecords } = useManager();

  const { data: assets } = useAssetsQuery(selectedChains.sourceChain.id);

  const [selectedAsset, setSelectedAsset] = useState(assets ? assets[0] : null);
  const [selectedAssetBalance, setSelectedAssetBalance] = useState("0");

  const [balances, setBalances] = useState<Record<string, string>>({});

  const [txPending, setTxPending] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (assets) {
      setSelectedAsset(assets[0]);
    }
  }, [assets]);

  useEffect(() => {
    if (!selectedAsset) {
      return;
    }

    const getBalance = async () => {
      if (!address) {
        return;
      }

      const client = await getStargateClient();

      const response = await client.getBalance(address, selectedAsset.denom);

      setSelectedAssetBalance(response.amount);
    };

    getBalance();
  }, [address, selectedAsset, getStargateClient, getCosmWasmClient]);

  useEffect(() => {
    const getBalances = async () => {
      if (!address) {
        return;
      }

      const client = await getStargateClient();

      const response = await client.getAllBalances(address);

      setBalances(
        response.reduce((acc, coin) => {
          acc[coin.denom] = coin.amount;

          return acc;
        }, {} as Record<string, string>)
      );
    };

    getBalances();
  }, [address, getStargateClient, selectedChains.sourceChain.id]);

  useEffect(() => {
    setSelectedAssetBalance("0");
  }, [selectedAsset]);

  const { data: solveRoute, status: solveRouteQueryStatus } =
    useSolveRouteQuery(
      selectedChains.sourceChain.id,
      selectedChains.targetChain.id,
      selectedAsset
    );

  const signAndSubmitIBCTransfer = async () => {
    if (!address || !solveRoute || !selectedAsset) {
      return;
    }

    setTxPending(true);

    try {
      const formattedAmount = ethers.parseUnits(amount, selectedAsset.decimals);

      const client = await getSigningStargateClient();

      let forwardMemo = {};
      if (solveRoute.route.length > 1) {
        const nextHop = solveRoute.route[1];

        const nextChain = chainRecords.find(
          (c) =>
            c.chain.chain_id ===
              mapChainlistIDToSolveID[selectedChains.targetChain.id] ??
            selectedChains.targetChain.id
        );

        if (!nextChain) {
          throw new Error("nextChain not found");
        }

        const receiver = toBech32(
          nextChain.chain.bech32_prefix,
          fromBech32(address).data
        );

        forwardMemo = {
          forward: {
            receiver,
            port: nextHop.port,
            channel: nextHop.channel,
            timeout: 0,
            retries: 2,
          },
        };
      }

      const routeChains: string[] = [];
      for (const hop of solveRoute.route) {
        routeChains.push(hop.chainId);
      }
      routeChains.push(mapChainlistIDToSolveID[selectedChains.targetChain.id]);

      const nextChain = chainRecords.find(
        (c) => c.chain.chain_id === routeChains[1]
      );

      if (!nextChain) {
        throw new Error("nextChain not found");
      }

      const currentHeight = await client.getHeight();

      client.registry.register(
        "/ibc.applications.transfer.v1.MsgTransfer",
        MsgTransfer
      );

      const msg = {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: {
          sender: address,
          receiver: toBech32(
            nextChain.chain.bech32_prefix,
            fromBech32(address).data
          ),
          sourceChannel: solveRoute.route[0].channel,
          sourcePort: solveRoute.route[0].port,
          token: {
            denom: selectedAsset.denom,
            amount: formattedAmount.toString(),
          },
          timeoutHeight: {
            revisionHeight: Long.fromNumber(currentHeight).add(100),
            revisionNumber: Long.fromNumber(currentHeight).add(100),
          },
          timeoutTimestamp: Long.fromNumber(0),
          memo: solveRoute.route.length > 1 ? JSON.stringify(forwardMemo) : "",
        },
      };

      const signer = await rest.getOfflineSignerDirect();

      const rpcEndpoint = await rest.getRpcEndpoint();

      const msgTransferType = defaultRegistryTypes.find((registryType) => {
        if (registryType[0] === "/ibc.applications.transfer.v1.MsgTransfer") {
          return true;
        }

        return false;
      }) as [string, GeneratedType];

      const originalEncode = msgTransferType[1].encode;

      // @ts-ignore
      msgTransferType[1].encode = (msg: any) => {
        console.log("called");

        const writer = originalEncode(msg);

        if (msg.memo !== "") {
          console.log(msg.memo);
          writer.uint32(66).string(msg.memo);
        }

        return writer;
      };

      const feeDenom = rest.chain.fees?.fee_tokens[0].denom ?? "ucosmos";

      const feeAmount =
        rest.chain.fees?.fee_tokens[0].average_gas_price ?? "0.025";

      const otherClient = await SigningStargateClient.connectWithSigner(
        rpcEndpoint,
        signer,
        {
          // @ts-ignore
          registry: new Registry([...defaultRegistryTypes]),
          gasPrice: GasPrice.fromString(`${feeAmount}${feeDenom}`),
        }
      );

      const tx = await otherClient.signAndBroadcast(address, [msg], "auto");

      setTxHash(tx.transactionHash);
    } catch (error) {
    } finally {
      setTxPending(false);
    }
  };

  return (
    <main className="px-4 pb-24">
      <div className="py-16">
        <p className="text-center font-black text-xl tracking-wider">
          ibc<span className="text-indigo-500">.fun</span>
        </p>
      </div>
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <div className="px-4 py-6 border border-zinc-700 rounded-lg space-y-8">
          <div className="md:grid grid-cols-2 gap-4">
            <div className="bg-zinc-800 p-4 rounded-t-md md:rounded-md">
              <p className="font-semibold text-sm mb-3">Source Chain</p>
              <ChainSelect
                chain={selectedChains.sourceChain}
                chains={chains}
                onSelect={(chain) =>
                  setSelectedChains({
                    ...selectedChains,
                    sourceChain: chain,
                    targetChain:
                      chain.id === selectedChains.targetChain.id
                        ? (chains.find(
                            (chain) =>
                              chain.id !== selectedChains.targetChain.id
                          ) as Chain)
                        : selectedChains.targetChain,
                  })
                }
              />
            </div>
            <div className="bg-zinc-800 p-4 rounded-b-md md:rounded-md">
              <p className="font-semibold text-sm mb-3">Destination Chain</p>
              <ChainSelect
                chain={selectedChains.targetChain}
                chains={chains}
                onSelect={(chain) =>
                  setSelectedChains({
                    ...selectedChains,
                    targetChain: chain,
                    sourceChain:
                      chain.id === selectedChains.sourceChain.id
                        ? (chains.find(
                            (chain) =>
                              chain.id !== selectedChains.sourceChain.id
                          ) as Chain)
                        : selectedChains.sourceChain,
                  })
                }
              />
            </div>
          </div>
          <div className="bg-zinc-800 p-4 rounded-md">
            <p className="font-semibold text-sm mb-3">Asset</p>
            <div className="border border-zinc-600 rounded-md p-4 space-y-4">
              <div className="sm:flex items-center">
                <div className="sm:w-48">
                  {selectedAsset && assets && (
                    <AssetSelect
                      asset={selectedAsset}
                      assets={assets}
                      balances={balances}
                      onSelect={(asset) => setSelectedAsset(asset)}
                    />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    className="bg-transparent font-bold text-xl p-4 placeholder:text-zinc-500 w-full outline-none"
                    type="text"
                    placeholder="0.000"
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  <span className="text-zinc-400">Amount Available:</span>{" "}
                  <span className="font-medium">
                    {ethers.formatUnits(
                      selectedAssetBalance,
                      selectedAsset?.decimals
                    )}
                  </span>
                </p>
                <button className="font-bold text-sm text-indigo-500 hover:text-indigo-400 active:text-indigo-500">
                  MAX
                </button>
              </div>
            </div>
          </div>
        </div>
        <Suspense fallback={null}>
          <div>
            {status === WalletStatus.Disconnected && (
              <button
                className="bg-indigo-600 hover:bg-indigo-500/90 active:bg-indigo-600 text-white focus-visible:outline-indigo-600 w-full rounded-md px-6 py-2.5 h-16 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                onClick={connectWallet}
              >
                Connect Wallet
              </button>
            )}
            {status === WalletStatus.Connected && (
              <button
                className="bg-indigo-600 hover:bg-indigo-500/90 active:bg-indigo-600 disabled:bg-indigo-500 disabled:opacity-70 disabled:pointer-events-none text-white focus-visible:outline-indigo-600 w-full rounded-md px-6 py-2.5 h-16 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors text-center"
                onClick={signAndSubmitIBCTransfer}
              >
                {solveRouteQueryStatus === "loading" && <span>Loading...</span>}
                {solveRouteQueryStatus === "error" && (
                  <span>No Route found</span>
                )}
                {solveRouteQueryStatus === "success" && !txPending && (
                  <span>Transfer {selectedAsset?.symbol}</span>
                )}
                {solveRouteQueryStatus === "success" && txPending && (
                  <div className="text-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 inline-block text-white"
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
              </button>
            )}
          </div>
        </Suspense>
        <div>
          {solveRoute && (
            <div className="pt-8">
              <p className="font-semibold text-gray-400 text-center">
                IBC Path:
              </p>
              <div className="flex items-center justify-center p-4 max-w-md mx-auto">
                {solveRoute.route.map((route) => {
                  const hopChain = chainRecords.find(
                    (chain) => chain.chain.chain_id === route.chainId
                  );

                  return (
                    <Fragment key={route.chainId}>
                      <p className="bg-indigo-100 text-indigo-600 text-sm font-semibold p-2 px-4 rounded">
                        {hopChain ? hopChain.chain.pretty_name : route.chainId}
                      </p>
                      <div className="flex-1 w-full h-[2px] border-t border-zinc-500 border-dashed" />
                    </Fragment>
                  );
                })}
                <p className="bg-indigo-100 text-indigo-600 text-sm font-semibold p-2 px-4 rounded">
                  {chainRecords.find(
                    (chain) =>
                      chain.chain.chain_id ===
                      mapChainlistIDToSolveID[selectedChains.targetChain.id]
                  )?.chain.pretty_name || selectedChains.targetChain.id}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {(txPending || txHash) && (
        <div
          aria-live="assertive"
          className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
          <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
            {/* Notification panel, dynamically insert this into the live region when it needs to be displayed */}
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {txPending && (
                      <svg
                        className="animate-spin -ml-1 h-5 w-5 inline-block text-indigo-500"
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

                    {txHash && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-5 h-5 text-emerald-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Transaction {txPending ? "Pending" : "Complete"}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    {txHash && (
                      <a
                        className="text-sm font-medium  text-indigo-500 underline"
                        href={`https://www.mintscan.io/${selectedChains.sourceChain.id}/txs/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
