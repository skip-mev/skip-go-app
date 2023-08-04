import { OfflineSigner } from "@cosmjs/proto-signing";
import {
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import { WalletClient, getFastestEndpoint } from "@cosmos-kit/core";
import * as chainRegistry from "chain-registry";
import { KeplrClient } from "@cosmos-kit/keplr-extension";
import { CosmostationClient } from "@cosmos-kit/cosmostation-extension/dist/extension/client";
import { LeapClient } from "@cosmos-kit/leap-extension/dist/extension/client";

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getChainByID(chainID: string) {
  return chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  ) as (typeof chainRegistry.chains)[0];
}

// cache clients to reuse later
const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: string) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;

  try {
    const client = await StargateClient.connect(preferredEndpoint, {});

    STARGATE_CLIENTS[chainID] = client;

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

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;

  try {
    const client = await SigningStargateClient.connectWithSigner(
      preferredEndpoint,
      signer,
      options
    );

    console.log(`Connected to ${preferredEndpoint}`);

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

export async function getAddressForChain(
  walletClient: WalletClient,
  chainId: string
) {
  if (walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();

    return accounts[0].address;
  }

  throw new Error("unsupported wallet");
}

// generic wrapper to support enabling chains on many different wallets
export async function enableChains(
  walletClient: WalletClient,
  chains: string[]
) {
  if (walletClient.enable) {
    return walletClient.enable(chains);
  }

  // @ts-ignore
  if (walletClient.ikeplr) {
    // @ts-ignore
    return walletClient.ikeplr.enable(chains);
  }

  throw new Error("Unsupported wallet");
}

export async function getAccount(walletClient: WalletClient, chainId: string) {
  if (walletClient.getAccount) {
    return walletClient.getAccount(chainId);
  }

  throw new Error("unsupported wallet");
}

export async function getOfflineSigner(
  walletClient: WalletClient,
  chainId: string
) {
  if (walletClient.getOfflineSignerDirect) {
    return walletClient.getOfflineSignerDirect(chainId);
  }

  throw new Error("unsupported wallet");
}

export async function getOfflineSignerOnlyAmino(
  walletClient: WalletClient,
  chainId: string
) {
  if (walletClient.getOfflineSignerAmino) {
    const signer = walletClient.getOfflineSignerAmino(chainId);
    return signer;
  }

  throw new Error("unsupported wallet");
}

export function getFee(chainID: string) {
  const chain = getChainByID(chainID);

  const feeInfo = chain.fees?.fee_tokens[0];

  if (!feeInfo) {
    throw new Error("No fee info found");
  }

  let averageGasPrice = 0;
  if (feeInfo.average_gas_price) {
    averageGasPrice = feeInfo.average_gas_price;
  }

  const amountNeeded = averageGasPrice * 1000000;

  return amountNeeded;
}

export async function isLedger(walletClient: WalletClient, chainID: string) {
  if (walletClient instanceof KeplrClient && window.keplr) {
    const key = await window.keplr.getKey(chainID);
    return key.isNanoLedger;
  }

  if (walletClient instanceof CosmostationClient) {
    // @ts-ignore
    const account = await window.cosmostation.cosmos.request({
      method: "cos_account",
      params: { chainName: chainID },
    });
    return account.isLedger;
  }

  if (walletClient instanceof LeapClient) {
    // @ts-ignore
    const key = await window.leap.getKey(chainID);

    return key.isNanoLedger;
  }

  return false;
}
