"use client";

import { ethers } from "ethers";
import ChainSelect, { Chain } from "@/components/ChainSelect";
import AssetSelect, { Asset } from "@/components/AssetSelect";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useChain, useManager } from "@cosmos-kit/react";
import { WalletStatus } from "@cosmos-kit/core";
import Long from "long";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { cosmos, ibc } from "juno-network";

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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

const mapChainlistIDToSolveID: Record<string, string> = {
  cosmos: "cosmoshub-4",
  osmosis: "osmosis-1",
  juno: "juno-1",
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
        `http://localhost:8080/v1/ibc/route?source_token=${
          asset.denom
        }&source_chain_id=${
          mapChainlistIDToSolveID[sourceChain] ?? sourceChain
        }&destination_token=${maybeMatchingAsset.denom}&destination_chain_id=${
          mapChainlistIDToSolveID[destinationChain] ?? destinationChain
        }`
      );

      return response.data as SolveRouteResponse;
    },
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
  // console.log(solveRoute);
  // console.log(solveRouteQueryStatus);

  const signAndSubmitIBCTransfer = async () => {
    // osmo1f2f9vryyu53gr8vhsksn66kugnxaa7k8jdpk0e
    // cosmos1f2f9vryyu53gr8vhsksn66kugnxaa7k86kjxet

    if (!address || !solveRoute || !selectedAsset) {
      return;
    }

    console.log(address);

    const decoded = fromBech32(address);

    console.log(toBech32("cosmos", decoded.data));

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
    routeChains.push(selectedChains.targetChain.id);

    const nextChain = chainRecords.find(
      (c) => c.chain.chain_id === routeChains[1]
    );

    if (!nextChain) {
      throw new Error("nextChain not found");
    }

    const currentHeight = await client.getHeight();

    // const { transfer } =
    //   ibc.applications.transfer.v1.MessageComposer.withTypeUrl;

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
          amount: "1000",
        },
        timeoutHeight: {
          revisionHeight: Long.fromNumber(currentHeight).add(100),
          revisionNumber: Long.fromNumber(currentHeight).add(100),
        },
        timeoutTimestamp: Long.fromNumber(0),
      },
      memo: JSON.stringify(forwardMemo),
    };

    const tx = await client.signAndBroadcast(address, [msg], "auto");

    console.log(tx);

    // console.log(
    //   toBech32(nextChain.chain.bech32_prefix, fromBech32(address).data)
    // );

    // const currentHeight = await client.getHeight();

    // const tx = await client.sendIbcTokens(
    //   address,
    //   toBech32(nextChain.chain.bech32_prefix, fromBech32(address).data),
    //   {
    //     denom: selectedAsset.denom,
    //     amount: "1000",
    //   },
    //   solveRoute.route[0].port,
    //   solveRoute.route[0].channel,
    //   {
    //     revisionHeight: Long.fromNumber(currentHeight).add(100),
    //     revisionNumber: Long.fromNumber(currentHeight).add(100),
    //   },
    //   undefined,
    //   "auto",
    //   JSON.stringify(forwardMemo)
    // );

    // console.log(tx);

    /* 
    
{
  "forward": {
    "receiver": "juno1caf8d22rfrjwm3dganyyv85fydhednkk534t9z",
    "port": "transfer",
    "channel": "channel-42",
    "timeout": 0,
    "retries": 2,
    "next": {
      "forward": {
        "receiver": "chihuahua1caf8d22rfrjwm3dganyyv85fydhednkkpkm7ru",
        "port": "transfer",
        "channel": "channel-28",
        "timeout": 0,
        "retries": 2
      }
    }
  }
}


    */

    //

    // const tx = await client.sendIbcTokens(
    //   "osmo1f2f9vryyu53gr8vhsksn66kugnxaa7k8jdpk0e",
    //   "cosmos1f2f9vryyu53gr8vhsksn66kugnxaa7k86kjxet",
    //   {
    //     denom: "uosmo",
    //     amount: "100",
    //   },
    //   "transfer",
    //   "channel-0",
    // {
    //   revisionHeight: Long.fromNumber(currentHeight).add(100),
    //   revisionNumber: Long.fromNumber(currentHeight).add(100),
    // },
    // undefined,
    // "auto"
    // );

    // console.log(tx);
    // client.sendIbcTokens()
  };

  return (
    <main className="px-4">
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
                className="bg-indigo-600 hover:bg-indigo-500/90 active:bg-indigo-600 disabled:bg-indigo-500 disabled:opacity-70 disabled:pointer-events-none text-white focus-visible:outline-indigo-600 w-full rounded-md px-6 py-2.5 h-16 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 transition-colors"
                onClick={signAndSubmitIBCTransfer}
              >
                {solveRouteQueryStatus === "loading" ? (
                  <span>Loading...</span>
                ) : (
                  <span>Bridge {selectedAsset?.symbol}</span>
                )}
              </button>
            )}
          </div>
        </Suspense>
        <div>{solveRoute && <div>{JSON.stringify(solveRoute)}</div>}</div>
        <div>
          {solveRoute && (
            <div>
              {solveRoute.route.map((route) => (
                <div key={route.chainId}>{route.chainId}</div>
              ))}
              {selectedChains.targetChain.id}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
