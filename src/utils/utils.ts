import { OfflineSigner } from "@cosmjs/proto-signing";
import {
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import { getFastestEndpoint } from "@cosmos-kit/core";
import { useChain, useManager } from "@cosmos-kit/react";
import * as chainRegistry from "chain-registry";
import { useRef, useEffect } from "react";

export function formatAddress(address: string, prefix: string) {
  return address.slice(0, prefix.length + 2) + "..." + address.slice(-4);
}

// helper method to get the chain name from the chain ID and return the corresponding chain record.
export function useChainByID(chainID: string) {
  const { chainRecords } = useManager();

  const chainRecord =
    chainRecords.find((record) => record.chain.chain_id === chainID) ??
    chainRecords[0];

  return useChain(chainRecord.name);
}

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    if (delay !== null) {
      const id = setTimeout(tick, delay);

      return () => clearTimeout(id);
    }
  }, [delay]);
}

export async function getFeeDenomsForChainID(chainID: string) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const denoms = chain.fees?.fee_tokens ?? [];

  return denoms;
}

export async function getStargateClientForChainID(chainID: string) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://${chain.chain_name}-rpc.polkachu.com`;
  try {
    const client = await StargateClient.connect(preferredEndpoint, {});
    return client;
  } catch {}

  const rpcEndpoints = chain.apis?.rpc ?? [];

  const endpoint = await getFastestEndpoint(
    rpcEndpoints.reduce((acc, endpoint) => {
      return [...acc, endpoint.address];
    }, [] as string[]),
    "rpc"
  );

  const client = await StargateClient.connect(endpoint, {});

  return client;
}

export async function getSigningStargateClientForChainID(
  chainID: string,
  signer: OfflineSigner,
  options?: SigningStargateClientOptions
) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://${chain.chain_name}-rpc.polkachu.com`;
  try {
    const client = await SigningStargateClient.connectWithSigner(
      preferredEndpoint,
      signer,
      options
    );

    return client;
  } catch {}

  const rpcEndpoints = chain.apis?.rpc ?? [];

  const endpoint = await getFastestEndpoint(
    rpcEndpoints.reduce((acc, endpoint) => {
      return [...acc, endpoint.address];
    }, [] as string[]),
    "rpc"
  );

  const client = await SigningStargateClient.connectWithSigner(
    endpoint,
    signer,
    options
  );

  return client;
}
