import { Asset } from "@/components/AssetSelect";
import { ChainConfig, SUPPORTED_CHAINS, chainIDToChainlistURL } from "@/config";
import { ChainRecord, ExtendedHttpEndpoint } from "@cosmos-kit/core";
import { useChain, useManager } from "@cosmos-kit/react";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Coin,
  GeneratedType,
  OfflineSigner,
  Registry,
} from "@cosmjs/proto-signing";
import Long from "long";
import {
  GasPrice,
  SigningStargateClient,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export interface IBCHop {
  port: string;
  channel: string;
  chainId: string;
  pfmEnabled: boolean;
}

interface SolveRouteResponse {
  route: IBCHop[];
}

export async function getRoute(
  sourceChainID: string,
  sourceDenom: string,
  destinationChainID: string,
  destinationDenom: string
) {
  const response = await axios.get("https://solve.skip.money/v1/ibc/route", {
    params: {
      source_chain_id: sourceChainID,
      source_token: sourceDenom,
      destination_chain_id: destinationChainID,
      destination_token: destinationDenom,
    },
  });

  if (response.status !== 200) {
    return null;
  }

  const route = response.data as SolveRouteResponse;

  if (route.route.length === 1) {
    return route;
  }

  for (const hop of route.route.slice(1)) {
    if (!hop.pfmEnabled) {
      console.log("route found but not pfm enabled");
      console.log(route);
      return null;
    }
  }

  return response.data as SolveRouteResponse;
}

export function useSolveForm() {
  const [transferAmount, setTransferAmount] = useState("");

  const [selectedChains, setSelectedChains] = useState({
    sourceChain: SUPPORTED_CHAINS[0],
    destinationChain: SUPPORTED_CHAINS[1],
  });

  const { data: assets } = useCommonAssets(
    selectedChains.sourceChain.id,
    selectedChains.destinationChain.id
  );

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  useEffect(() => {
    if (assets) {
      setSelectedAsset(assets[0]);
    }
  }, [assets]);

  useEffect(() => {
    setTransferAmount("");
  }, [selectedAsset]);

  const { status: solveRouteQueryStatus, data } = useQuery({
    queryKey: [
      "solveRoute",
      selectedAsset?.denom ?? "null",
      selectedChains.sourceChain.id,
      selectedChains.destinationChain.id,
    ],
    queryFn: async () => {
      if (!selectedAsset) {
        return Promise.resolve(null);
      }

      const desinationChainAssets = await getAssets(
        selectedChains.destinationChain.id
      );

      const destinationDenom = desinationChainAssets.find((asset) => {
        return (
          asset.origin_chain === selectedAsset.origin_chain &&
          asset.origin_denom === selectedAsset.origin_denom
        );
      });

      if (!destinationDenom) {
        return undefined;
      }

      return getRoute(
        selectedChains.sourceChain.id,
        selectedAsset.denom,
        selectedChains.destinationChain.id,
        destinationDenom.denom
      );
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!selectedAsset,
  });

  return {
    assets: assets ?? [],
    selectedAsset,
    selectAsset: (asset: Asset) => {
      setSelectedAsset(asset);
    },
    chains: SUPPORTED_CHAINS,
    destinationChain: selectedChains.destinationChain,
    setDestinationChain: (chain: ChainConfig) => {
      setSelectedChains({
        ...selectedChains,
        destinationChain: chain,
      });
    },
    sourceChain: selectedChains.sourceChain,
    setSourceChain: (chain: ChainConfig) => {
      setSelectedChains({
        ...selectedChains,
        sourceChain: chain,
      });
    },
    transferAmount,
    setTransferAmount,
    solveRouteQueryStatus,
    route: data?.route ?? null,
  };
}

async function getAssets(chainID: string) {
  const response = await axios.get(
    `${chainIDToChainlistURL(chainID)}/assets.json`
  );
  const responseJSON = response.data;

  return responseJSON as Asset[];
}

// Retrieves assets from chainA and chainB and returns assets with matching origin chain IDs and origin denoms
function useCommonAssets(chainA: string, chainB: string) {
  return useQuery({
    queryKey: ["commonAssets", chainA, chainB],
    queryFn: async () => {
      const assetsChainA = await getAssets(chainA);
      const assetsChainB = await getAssets(chainB);

      const commonAssets = assetsChainA.filter((assetA) => {
        return assetsChainB.some((assetB) => {
          return (
            assetA.origin_chain === assetB.origin_chain &&
            assetA.origin_denom === assetB.origin_denom
          );
        });
      });

      return commonAssets;
    },
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

interface IBCTransferMemo {
  forward: {
    receiver: string;
    port: string;
    channel: string;
    timeout: number;
    retries: number;
    next?: IBCTransferMemo;
  };
}

export function useIBCTransfer() {
  const { chainRecords } = useManager();

  return async (
    amount: string,
    denom: string,
    senderAddr: string,
    sourceChainID: string,
    destinationChainID: string,
    route: IBCHop[],
    offlineSigner: OfflineSigner,
    rpcEndpoint: string | ExtendedHttpEndpoint
  ) => {
    const sourceChain = chainRecords.find(
      (c) => c.chain.chain_id === sourceChainID
    ) as ChainRecord;

    const destinationChain = chainRecords.find(
      (c) => c.chain.chain_id === destinationChainID
    ) as ChainRecord;

    const feeDenom = sourceChain.chain.fees?.fee_tokens[0].denom ?? "uatom";

    const feeAmount =
      sourceChain.chain.fees?.fee_tokens[0].average_gas_price ?? "0.025";

    const signer = await SigningStargateClient.connectWithSigner(
      rpcEndpoint,
      offlineSigner,
      {
        registry: new Registry([...defaultRegistryTypes]),
        gasPrice: GasPrice.fromString(`${feeAmount}${feeDenom}`),
      }
    );

    const currentHeight = await signer.getHeight();

    const addresses = [];
    for (const hop of route) {
      const chain = chainRecords.find(
        (c) => c.chain.chain_id === hop.chainId
      ) as ChainRecord;

      addresses.push(
        toBech32(chain.chain.bech32_prefix, fromBech32(senderAddr).data)
      );
    }

    addresses.push(
      toBech32(
        destinationChain.chain.bech32_prefix,
        fromBech32(senderAddr).data
      )
    );

    const r = JSON.parse(
      '{"source_port":"transfer","source_channel":"channel-0","token":{"denom":"ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2","amount":"10000"},"sender":"osmo1f2f9vryyu53gr8vhsksn66kugnxaa7k8jdpk0e","receiver":"cosmos1f2f9vryyu53gr8vhsksn66kugnxaa7k86kjxet","timeout_height":{},"memo":"{\\"forward\\":{\\"receiver\\":\\"juno1f2f9vryyu53gr8vhsksn66kugnxaa7k8vy3a7h\\",\\"port\\":\\"transfer\\",\\"channel\\":\\"channel-207\\",\\"timeout\\":0,\\"retries\\":2}}"}'
    );

    console.log(r);

    // const memo = buildMemo(addresses, route);
    const memo = r.memo;

    const msg = {
      typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
      value: {
        sender: senderAddr,
        receiver: addresses[1],
        sourceChannel: route[0].channel,
        sourcePort: route[0].port,
        token: {
          denom,
          amount,
        },
        timeoutHeight: {
          revisionHeight: Long.fromNumber(currentHeight).add(100),
          revisionNumber: Long.fromNumber(currentHeight).add(100),
        },
        timeoutTimestamp: Long.fromNumber(0),
        memo,
      },
    };

    return signer.signAndBroadcast(senderAddr, [msg], "auto");
  };
}

function buildMemo(addresses: string[], route: IBCHop[]) {
  const memo = createNestedResponse(addresses.slice(1), [...route]);

  if (!memo) {
    throw new Error("memo is null");
  }

  return memo.forward.next ? JSON.stringify(memo.forward.next) : "";
}

function createNestedResponse(
  addresses: string[],
  route: IBCHop[]
): IBCTransferMemo | undefined {
  // Get the first item from the route
  const item = route.shift();
  const address = addresses.shift();

  // If there are no more items in the route, return null
  if (!item || !address) {
    return;
  }

  // Create the nested response object
  const nestedResponse = {
    forward: {
      receiver: address,
      port: item.port,
      channel: item.channel,
      timeout: 0,
      retries: 2,
      next: createNestedResponse(addresses, route),
    },
  };

  return nestedResponse;
}
