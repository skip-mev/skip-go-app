import { useRef, useEffect } from "react";
import { OfflineSigner } from "@cosmjs/proto-signing";
import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from "@cosmjs/cosmwasm-stargate";
import {
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import { getFastestEndpoint } from "@cosmos-kit/core";
import { useChain, useManager } from "@cosmos-kit/react";
import * as chainRegistry from "chain-registry";
import {
  generateEndpointAccount,
  generatePostBodyBroadcast,
  generateEndpointBroadcast,
} from "@evmos/provider";
import axios from "axios";
import {
  Chain,
  Fee,
  IBCMsgTransferParams,
  Sender,
  TxContext,
  createTxIBCMsgTransfer,
} from "@evmos/transactions";
import { createTxRaw } from "@evmos/proto";
import Long from "long";
import {
  BaseAccount,
  ChainRestAuthApi,
  ChainRestTendermintApi,
  Msgs,
  TxRestClient,
  createTransaction,
  getTxRawFromTxRawOrDirectSignResponse,
} from "@injectivelabs/sdk-ts";
import {
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
  BigNumberInBase,
} from "@injectivelabs/utils";

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

export async function getAddressForChain(chainId: string) {
  if (!window.keplr) {
    throw new Error("Keplr extension is not installed");
  }

  const signer = window.keplr.getOfflineSigner(chainId);
  const accounts = await signer.getAccounts();

  return accounts[0].address;
}

export async function getSigningCosmWasmClientForChainID(
  chainID: string,
  signer: OfflineSigner,
  options?: SigningCosmWasmClientOptions
) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;
  try {
    const client = await SigningCosmWasmClient.connectWithSigner(
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

  const client = await SigningCosmWasmClient.connectWithSigner(
    endpoint,
    signer,
    options
  );

  return client;
}

export async function signAndBroadcastEvmos(
  signerAddress: string,
  params: IBCMsgTransferParams
) {
  // console.log(params);
  const chainID = "evmos_9001-2";

  if (!window.keplr) {
    throw new Error("Keplr extension is not installed");
  }

  const result = await axios.get(
    `https://rest.bd.evmos.org:1317${generateEndpointAccount(signerAddress)}`
  );

  const account = await window.keplr.getKey(chainID);
  const pk = Buffer.from(account.pubKey).toString("base64");

  const chain: Chain = {
    chainId: 9001,
    cosmosChainId: "evmos_9001-2",
  };

  // Populate the transaction sender parameters using the
  // query API.

  const sender: Sender = {
    accountAddress: signerAddress,
    sequence: result.data.account.base_account.sequence,
    accountNumber: result.data.account.base_account.account_number,
    // Use the public key from the account query, or retrieve
    // the public key from the code snippet above.
    pubkey: pk,
  };

  const fee: Fee = {
    amount: "4000000000000000",
    denom: "aevmos",
    gas: "200000",
  };

  const memo = "";

  const context: TxContext = {
    chain,
    sender,
    fee,
    memo,
  };

  const tx = createTxIBCMsgTransfer(context, params);

  const { signDirect } = tx;

  const signResponse = await window.keplr.signDirect(
    chain.cosmosChainId,
    sender.accountAddress,
    {
      bodyBytes: signDirect.body.toBinary(),
      authInfoBytes: signDirect.authInfo.toBinary(),
      chainId: chain.cosmosChainId,
      accountNumber: new Long(sender.accountNumber),
    }
  );

  if (!signResponse) {
    // Handle signature failure here.
    throw new Error("Signature failed");
  }

  const signatures = [
    new Uint8Array(Buffer.from(signResponse.signature.signature, "base64")),
  ];

  const { signed } = signResponse;

  const signedTx = createTxRaw(
    signed.bodyBytes,
    signed.authInfoBytes,
    signatures
  );

  const response = await axios.post(
    `https://rest.bd.evmos.org:1317${generateEndpointBroadcast()}`,
    generatePostBodyBroadcast(signedTx)
  );

  return response;
}

export async function signAndBroadcastInjective(
  signerAddress: string,
  msgs: Msgs | Msgs[]
) {
  const chainID = "injective-1";
  const restEndpoint = "https://lcd.injective.network";

  const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);

  const accountDetailsResponse = await chainRestAuthApi.fetchAccount(
    signerAddress
  );
  const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);

  /** Block Details */
  const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint);
  const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
  const latestHeight = latestBlock.header.height;
  const timeoutHeight = new BigNumberInBase(latestHeight).plus(
    DEFAULT_BLOCK_TIMEOUT_HEIGHT
  );

  if (!window.keplr) {
    throw new Error("Keplr extension is not installed");
  }

  const account = await window.keplr.getKey(chainID);
  const pk = Buffer.from(account.pubKey).toString("base64");

  const { signDoc } = createTransaction({
    pubKey: pk,
    chainId: chainID,
    message: msgs,
    sequence: baseAccount.sequence,
    accountNumber: baseAccount.accountNumber,
    timeoutHeight: timeoutHeight.toNumber(),
  });

  const directSignResponse = await window.keplr.signDirect(
    chainID,
    signerAddress,
    // @ts-ignore
    signDoc
  );

  const txRaw = getTxRawFromTxRawOrDirectSignResponse(directSignResponse);

  const txRestClient = new TxRestClient(restEndpoint);

  const tx = await txRestClient.broadcast(txRaw, {
    // @ts-ignore
    mode: "sync",
  });

  return tx;
}
