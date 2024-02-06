import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { AccountParser, StargateClient } from "@cosmjs/stargate";
import { strideAccountParser } from "stridejs";

import { getNodeProxyEndpoint } from "./api";

const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: string) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  let accountParser: AccountParser | undefined;
  if (chainID.includes("stride")) {
    accountParser = strideAccountParser;
  }

  const client = await StargateClient.connect(preferredEndpoint, {
    accountParser,
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
