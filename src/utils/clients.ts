import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { StargateClient } from "@cosmjs/stargate";

import { getNodeProxyEndpoint } from "./api";
import { getCustomAccountParser } from "./stargate";

const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: string) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await StargateClient.connect(preferredEndpoint, {
    accountParser: getCustomAccountParser(chainID),
  });

  STARGATE_CLIENTS[chainID] = client;

  return client;
}

const COSMWASM_CLIENTS: Record<string, CosmWasmClient> = {};

export async function getCosmWasmClientForChainID(chainID: string) {
  if (COSMWASM_CLIENTS[chainID]) {
    return COSMWASM_CLIENTS[chainID];
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await CosmWasmClient.connect(preferredEndpoint);

  COSMWASM_CLIENTS[chainID] = client;

  return client;
}
