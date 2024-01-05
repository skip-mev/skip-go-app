import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";

import { ChainId, chainIdToName } from "@/chains/types";

import { getNodeProxyEndpoint } from "./api";

const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: ChainId) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const chainName = chainIdToName[chainID];

  if (!chainName) {
    throw new Error(`stargateClient error: chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await StargateClient.connect(preferredEndpoint, {});

  STARGATE_CLIENTS[chainID] = client;

  return client;
}

const COSMWASM_CLIENTS: Record<string, CosmWasmClient> = {};

export async function getCosmWasmClientForChainID(chainID: ChainId) {
  if (COSMWASM_CLIENTS[chainID]) {
    return COSMWASM_CLIENTS[chainID];
  }

  const chainName = chainIdToName[chainID];

  if (!chainName) {
    throw new Error(`cosmWasmClient error: chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await CosmWasmClient.connect(preferredEndpoint);

  COSMWASM_CLIENTS[chainID] = client;

  return client;
}
