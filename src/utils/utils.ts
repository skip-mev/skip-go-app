/* eslint-disable @typescript-eslint/ban-ts-comment */
import { encodeSecp256k1Pubkey, makeSignDoc } from "@cosmjs/amino";
import {
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from "@cosmjs/cosmwasm-stargate";
import { fromBase64 } from "@cosmjs/encoding";
import { Int53 } from "@cosmjs/math";
import {
  EncodeObject,
  encodePubkey,
  makeAuthInfoBytes,
  OfflineSigner,
  TxBodyEncodeObject,
} from "@cosmjs/proto-signing";
import {
  AminoTypes,
  createDefaultAminoConverters,
  SignerData,
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
  StdFee,
} from "@cosmjs/stargate";
import { getFastestEndpoint, WalletClient } from "@cosmos-kit/core";
import { CosmostationClient } from "@cosmos-kit/cosmostation-extension/cjs/extension/client";
import { KeplrClient } from "@cosmos-kit/keplr-extension";
import { LeapClient } from "@cosmos-kit/leap-extension/cjs/extension/client";
import {
  BaseAccount,
  ChainRestAuthApi,
  ChainRestTendermintApi,
  createTransaction,
  getTxRawFromTxRawOrDirectSignResponse,
  Msgs,
  TxRestClient,
} from "@injectivelabs/sdk-ts";
import {
  BigNumberInBase,
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
} from "@injectivelabs/utils";
import { OfflineAminoSigner } from "@keplr-wallet/types";
import * as chainRegistry from "chain-registry";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

export function isEVMChain(chainID: string) {
  return [
    "42161",
    "43114",
    "8453",
    "56",
    "9790",
    "42220",
    "1",
    "250",
    "314",
    "2222",
    "59144",
    "1284",
    "10",
    "137",
    "80001"
  ].includes(chainID);
}

export function getChainByID(chainID: string) {
  return chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID,
  ) as (typeof chainRegistry.chains)[0];
}

// cache clients to reuse later
const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: string) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID,
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;

  try {
    const client = await StargateClient.connect(preferredEndpoint, {});

    STARGATE_CLIENTS[chainID] = client;

    return client;
  } catch {
    /* empty */
  }

  const rpcEndpoints = chain.apis?.rpc ?? [];

  const endpoint = await getFastestEndpoint(
    rpcEndpoints.reduce((acc, endpoint) => {
      return [...acc, endpoint.address];
    }, [] as string[]),
    "rpc",
  );

  const client = await StargateClient.connect(endpoint, {});

  return client;
}

export async function getSigningStargateClientForChainID(
  chainID: string,
  signer: OfflineSigner,
  options?: SigningStargateClientOptions,
) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID,
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;

  try {
    const client = await SigningStargateClient.connectWithSigner(
      preferredEndpoint,
      signer,
      options,
    );

    console.log(`Connected to ${preferredEndpoint}`);

    return client;
  } catch {
    /* empty */
  }

  const rpcEndpoints = chain.apis?.rpc ?? [];

  const endpoint = await getFastestEndpoint(
    rpcEndpoints.reduce((acc, endpoint) => {
      return [...acc, endpoint.address];
    }, [] as string[]),
    "rpc",
  );

  const client = await SigningStargateClient.connectWithSigner(
    endpoint,
    signer,
    options,
  );

  return client;
}

export async function getAddressForChain(
  walletClient: WalletClient,
  chainId: string,
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
  options?: SigningCosmWasmClientOptions,
) {
  const chain = chainRegistry.chains.find(
    (chain) => chain.chain_id === chainID,
  );

  if (!chain) {
    throw new Error(`Chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = `https://ibc.fun/nodes/${chainID}`;
  try {
    const client = await SigningCosmWasmClient.connectWithSigner(
      preferredEndpoint,
      signer,
      options,
    );

    return client;
  } catch {
    /* empty */
  }

  const rpcEndpoints = chain.apis?.rpc ?? [];

  const endpoint = await getFastestEndpoint(
    rpcEndpoints.reduce((acc, endpoint) => {
      return [...acc, endpoint.address];
    }, [] as string[]),
    "rpc",
  );

  const client = await SigningCosmWasmClient.connectWithSigner(
    endpoint,
    signer,
    options,
  );

  return client;
}

export async function signAndBroadcastInjective(
  walletClient: WalletClient,
  signerAddress: string,
  msgs: Msgs | Msgs[],
  fee: StdFee,
) {
  const chainID = "injective-1";
  const restEndpoint = "https://lcd.injective.network";

  const chainRestAuthApi = new ChainRestAuthApi(restEndpoint);

  const accountDetailsResponse =
    await chainRestAuthApi.fetchAccount(signerAddress);
  const baseAccount = BaseAccount.fromRestApi(accountDetailsResponse);

  /** Block Details */
  const chainRestTendermintApi = new ChainRestTendermintApi(restEndpoint);
  const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
  const latestHeight = latestBlock.header.height;
  const timeoutHeight = new BigNumberInBase(latestHeight).plus(
    DEFAULT_BLOCK_TIMEOUT_HEIGHT,
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
    signDoc,
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
  chains: string[],
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
  chainId: string,
) {
  if (walletClient.getOfflineSignerDirect) {
    return walletClient.getOfflineSignerDirect(chainId);
  }

  throw new Error("unsupported wallet");
}

export async function getOfflineSignerOnlyAmino(
  walletClient: WalletClient,
  chainId: string,
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

export function getExplorerLinkForTx(chainID: string, txHash: string) {
  const chain = getChainByID(chainID);

  if (!chain) {
    return null;
  }

  if (!chain.explorers) {
    return null;
  }

  const mintscan = chain.explorers.find(
    (explorer) => explorer.kind === "mintscan",
  );

  if (mintscan && mintscan.tx_page) {
    return mintscan.tx_page.replace("${txHash}", txHash);
  }

  return chain.explorers[0].tx_page?.replace("${txHash}", txHash) ?? null;
}

// TODO: planning on refactoring the tx process, where this will find a better home.
export async function signAmino(
  client: SigningStargateClient,
  signer: OfflineAminoSigner,
  signerAddress: string,
  messages: readonly EncodeObject[],
  fee: StdFee,
  memo: string,
  { accountNumber, sequence, chainId }: SignerData,
) {
  const aminoTypes = new AminoTypes(createDefaultAminoConverters());

  const accountFromSigner = (await signer.getAccounts()).find(
    (account) => account.address === signerAddress,
  );
  if (!accountFromSigner) {
    throw new Error("Failed to retrieve account from signer");
  }

  const pubkey = encodePubkey(encodeSecp256k1Pubkey(accountFromSigner.pubkey));

  const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

  const msgs = messages.map((msg) => aminoTypes.toAmino(msg));

  msgs[0].value.memo = messages[0].value.memo;

  const signDoc = makeSignDoc(
    msgs,
    fee,
    chainId,
    memo,
    accountNumber,
    sequence,
  );

  const { signature, signed } = await signer.signAmino(signerAddress, signDoc);

  const signedTxBody = {
    messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
    memo: signed.memo,
  };

  signedTxBody.messages[0].value.memo = messages[0].value.memo;

  const signedTxBodyEncodeObject: TxBodyEncodeObject = {
    typeUrl: "/cosmos.tx.v1beta1.TxBody",
    value: signedTxBody,
  };

  const signedTxBodyBytes = client.registry.encode(signedTxBodyEncodeObject);

  const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
  const signedSequence = Int53.fromString(signed.sequence).toNumber();

  const signedAuthInfoBytes = makeAuthInfoBytes(
    [{ pubkey, sequence: signedSequence }],
    signed.fee.amount,
    signedGasLimit,
    signed.fee.granter,
    signed.fee.payer,
    signMode,
  );

  return TxRaw.fromPartial({
    bodyBytes: signedTxBodyBytes,
    authInfoBytes: signedAuthInfoBytes,
    signatures: [fromBase64(signature.signature)],
  });
}
