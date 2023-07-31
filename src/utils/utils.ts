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
  StdFee,
} from "@cosmjs/stargate";
import { WalletClient, getFastestEndpoint } from "@cosmos-kit/core";
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
import { KeplrClient } from "@cosmos-kit/keplr-extension";
import { CosmostationClient } from "@cosmos-kit/cosmostation-extension/dist/extension/client";
import { LeapClient } from "@cosmos-kit/leap-extension/dist/extension/client";

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
  walletClient: WalletClient,
  signerAddress: string,
  params: IBCMsgTransferParams
) {
  const chainID = "evmos_9001-2";

  const result = await axios.get(
    `https://rest.bd.evmos.org:1317${generateEndpointAccount(signerAddress)}`
  );

  const account = await getAccount(walletClient, chainID);

  const pk = Buffer.from(account.pubkey).toString("base64");

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

  const signer = await getOfflineSigner(walletClient, chainID);

  const signResponse = await signer.signDirect(sender.accountAddress, {
    bodyBytes: signDirect.body.toBinary(),
    authInfoBytes: signDirect.authInfo.toBinary(),
    chainId: chain.cosmosChainId,
    accountNumber: new Long(sender.accountNumber),
  });

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
    generatePostBodyBroadcast(signedTx, "BROADCAST_MODE_BLOCK")
  );

  return response.data.tx_response;
}

export async function signAndBroadcastInjective(
  walletClient: WalletClient,
  signerAddress: string,
  msgs: Msgs | Msgs[],
  fee: StdFee
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

  const account = await getAccount(walletClient, chainID);
  const pk = Buffer.from(account.pubkey).toString("base64");

  const { signDoc } = createTransaction({
    pubKey: pk,
    chainId: chainID,
    message: msgs,
    sequence: baseAccount.sequence,
    accountNumber: baseAccount.accountNumber,
    timeoutHeight: timeoutHeight.toNumber(),
    fee,
  });

  const signer = await getOfflineSigner(walletClient, chainID);

  const directSignResponse = await signer.signDirect(
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
    return walletClient.getOfflineSignerAmino(chainId);
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
