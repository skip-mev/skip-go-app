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
import { CosmostationClient } from "@cosmos-kit/cosmostation-extension/dist/extension/client";
import { KeplrClient } from "@cosmos-kit/keplr-extension";
import { LeapClient } from "@cosmos-kit/leap-extension/dist/extension/client";
import { OfflineAminoSigner } from "@keplr-wallet/types";
import { SkipRouter } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { erc20ABI, PublicClient, usePublicClient } from "wagmi";

import { Chain } from "@/api/queries";
import { ChainId, getChain } from "@/chains";
import { multicall3ABI } from "@/constants/abis";
import { EVM_CHAINS } from "@/constants/constants";
import { useSkipClient } from "@/solve";

export function getChainByID(chainID: ChainId) {
  return getChain(chainID);
}

// cache clients to reuse later
const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: ChainId) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const chain = getChainByID(chainID);

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
  chainID: ChainId,
  signer: OfflineSigner,
  options?: SigningStargateClientOptions,
) {
  const chain = getChainByID(chainID);

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

export async function getAddressForCosmosChain(
  walletClient: WalletClient,
  chainId: ChainId,
) {
  if (walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();

    return accounts[0].address;
  }

  throw new Error("unsupported wallet");
}

export async function getSigningCosmWasmClientForChainID(
  chainID: ChainId,
  signer: OfflineSigner,
  options?: SigningCosmWasmClientOptions,
) {
  const chain = getChainByID(chainID);

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

  if ("snapInstalled" in walletClient) {
    return;
  }

  throw new Error("Unsupported wallet");
}

export async function getAccount(walletClient: WalletClient, chainId: ChainId) {
  if (walletClient.getAccount) {
    return walletClient.getAccount(chainId);
  }

  throw new Error("unsupported wallet");
}

export async function getOfflineSigner(
  walletClient: WalletClient,
  chainId: ChainId,
) {
  if (walletClient.getOfflineSignerDirect) {
    return walletClient.getOfflineSignerDirect(chainId);
  }

  if (walletClient.getOfflineSigner) {
    return walletClient.getOfflineSigner(chainId, "direct");
  }

  throw new Error("unsupported wallet");
}

export async function getOfflineSignerOnlyAmino(
  walletClient: WalletClient,
  chainId: ChainId,
) {
  if (walletClient.getOfflineSignerAmino) {
    const signer = walletClient.getOfflineSignerAmino(chainId);
    return signer;
  }

  throw new Error("unsupported wallet");
}

export function getFee(chainID: ChainId) {
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

export async function isLedger(walletClient: WalletClient, chainID: ChainId) {
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

export function getExplorerLinkForTx(chainID: ChainId, txHash: string) {
  const evmChain = EVM_CHAINS.find((c) => c.id === parseInt(chainID));

  if (evmChain) {
    return `${evmChain.blockExplorers.default.url}/tx/${txHash}`;
  }

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

export async function getBalancesByChain(address: string, chainID: ChainId) {
  const client = await getStargateClientForChainID(chainID);

  const balances = await client.getAllBalances(address);

  return balances.reduce(
    (acc, balance) => {
      return {
        ...acc,
        [balance.denom]: balance.amount,
      };
    },
    {} as Record<string, string>,
  );
}

export function useBalancesByChain(
  address?: string,
  chain?: Chain,
  enabled: boolean = true,
) {
  const publicClient = usePublicClient({
    chainId: chain?.chainType === "evm" ? parseInt(chain.chainID) : undefined,
  });

  const skipRouter = useSkipClient();

  return useQuery({
    queryKey: ["balances-by-chain", address, chain],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      if (chain.chainType === "evm") {
        return getEvmChainBalances(
          skipRouter,
          publicClient,
          address,
          chain.chainID,
        );
      }

      return getBalancesByChain(address, chain.chainID);
    },
    refetchInterval: 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
    enabled: !!chain && !!address && enabled,
  });
}

async function getEvmChainBalances(
  skipClient: SkipRouter,
  publicClient: PublicClient,
  address: string,
  chainID: ChainId,
) {
  const assets = await skipClient.assets({
    chainID,
    includeEvmAssets: true,
  });

  const chainAssets = assets[chainID];

  const balances = await publicClient.multicall({
    multicallAddress: "0xcA11bde05977b3631167028862bE2a173976CA11",
    contracts: chainAssets.map((asset) => {
      if (!asset.tokenContract) {
        return {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11",
          abi: multicall3ABI,
          functionName: "getEthBalance",
          args: [address as `0x${string}`],
        };
      }

      return {
        address: asset.tokenContract as `0x${string}`,
        abi: erc20ABI,
        functionName: "balanceOf",
        args: [address as `0x${string}`],
      };
    }),
  });

  return chainAssets.reduce(
    (acc, asset, index) => {
      return {
        ...acc,
        [asset.denom]: balances[index].result?.toString() || "0",
      };
    },
    {} as Record<string, string>,
  );
}

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
