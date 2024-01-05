import { OfflineAminoSigner } from "@cosmjs/amino";
import {
  CosmWasmClient,
  SigningCosmWasmClient,
  SigningCosmWasmClientOptions,
} from "@cosmjs/cosmwasm-stargate";
import { OfflineDirectSigner, OfflineSigner } from "@cosmjs/proto-signing";
import {
  SigningStargateClient,
  SigningStargateClientOptions,
  StargateClient,
} from "@cosmjs/stargate";
import { SkipRouter } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { erc20ABI, PublicClient, usePublicClient } from "wagmi";

import { ChainId } from "@/chains/types";
import { multicall3ABI } from "@/constants/abis";
import { EVM_CHAINS } from "@/constants/wagmi";
import { AssetWithMetadata } from "@/context/assets";
import { Chain } from "@/hooks/useChains";
import { MergedWalletClient } from "@/lib/cosmos-kit";
import { useSkipClient } from "@/solve";

import { getNodeProxyEndpoint } from "./api";

// cache clients to reuse later
const STARGATE_CLIENTS: Record<string, StargateClient> = {};

export async function getStargateClientForChainID(chainID: ChainId) {
  if (STARGATE_CLIENTS[chainID]) {
    return STARGATE_CLIENTS[chainID];
  }

  const chain = getChainByID(chainID);

  if (!chain) {
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

  const chain = getChainByID(chainID);

  if (!chain) {
    throw new Error(`cosmWasmClient error: chain with ID ${chainID} not found`);
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await CosmWasmClient.connect(preferredEndpoint);

  COSMWASM_CLIENTS[chainID] = client;

  return client;
}

export async function getSigningStargateClientForChainID(
  chainID: ChainId,
  signer: OfflineSigner,
  options?: SigningStargateClientOptions,
) {
  const chain = getChainByID(chainID);

  if (!chain) {
    throw new Error(
      `signingStargateClient error: chain with ID ${chainID} not found`,
    );
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await SigningStargateClient.connectWithSigner(
    preferredEndpoint,
    signer,
    options,
  );

  console.info(`signingStargateClient: Connected to ${preferredEndpoint}`);

  return client;
}

export async function getAddressForCosmosChain<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
) {
  if ("getOfflineSigner" in walletClient && walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();
    return accounts[0].address;
  }

  if ("getAccount" in walletClient && walletClient.getAccount) {
    const account = await walletClient.getAccount(chainId);
    return account.address;
  }

  if ("getSimpleAccount" in walletClient) {
    const account = await walletClient.getSimpleAccount(chainId);
    return account.address;
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have 'getOfflineSigner' or 'getSimpleAccount'`,
  );
}

export async function getSigningCosmWasmClientForChainID(
  chainID: ChainId,
  signer: OfflineSigner,
  options?: SigningCosmWasmClientOptions,
) {
  if (!getChainByID(chainID)) {
    throw new Error(
      `signingCosmWasmClient error: chain with ID ${chainID} not found`,
    );
  }

  const preferredEndpoint = getNodeProxyEndpoint(chainID);

  const client = await SigningCosmWasmClient.connectWithSigner(
    preferredEndpoint,
    signer,
    options,
  );

  return client;
}

// generic wrapper to support enabling chains on many different wallets
export async function enableChains<T extends MergedWalletClient>(
  walletClient: T,
  chains: string[],
) {
  // mostly everything else
  if ("enable" in walletClient && walletClient.enable) {
    return walletClient.enable(chains);
  }

  // cosmostation
  if ("ikeplr" in walletClient) {
    return walletClient.ikeplr.enable(chains);
  }

  // metamask snaps
  if ("snapInstalled" in walletClient) {
    return;
  }

  // station
  if ("client" in walletClient && "keplr" in walletClient.client) {
    return walletClient.client.keplr.enable(chains);
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have methods to enable chains`,
  );
}

export async function getAccount<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
) {
  if (walletClient.getAccount) {
    return walletClient.getAccount(chainId);
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have 'getAccount'`,
  );
}

export async function getOfflineSigner<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
): Promise<OfflineDirectSigner> {
  if (
    "getOfflineSignerDirect" in walletClient &&
    walletClient.getOfflineSignerDirect
  ) {
    return walletClient.getOfflineSignerDirect(chainId);
  }

  if ("getOfflineSigner" in walletClient && walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId, "direct");
    if ("signDirect" in signer) return signer;
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have 'getOfflineSigner' or 'getOfflineSignerDirect'`,
  );
}

export async function getOfflineSignerOnlyAmino<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
): Promise<OfflineAminoSigner> {
  if (
    "getOfflineSignerAmino" in walletClient &&
    walletClient.getOfflineSignerAmino
  ) {
    return walletClient.getOfflineSignerAmino(chainId);
  }

  if ("getOfflineSigner" in walletClient && walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId, "amino");
    if ("signAmino" in signer) return signer;
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have 'getOfflineSigner' or 'getOfflineSignerAmino'`,
  );
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

export async function isLedger<T extends MergedWalletClient>(
  walletClient: T,
  chainID: ChainId,
) {
  // mostly everything else
  if ("client" in walletClient && "getKey" in walletClient.client) {
    const key = await walletClient.client.getKey(chainID);
    return key.isNanoLedger;
  }

  // cosmostation
  if ("client" in walletClient && "cosmos" in walletClient.client) {
    const account = await walletClient.client.cosmos.request({
      method: "cos_account",
      params: { chainName: chainID },
    });
    return Boolean(account.isLedger);
  }

  return false;
}

export function getExplorerLinkForTx(chainID: ChainId, txHash: string) {
  const evmChain = EVM_CHAINS.find((c) => c.id === parseInt(chainID));

  if (evmChain?.blockExplorers) {
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

export async function getBalancesByChain(
  address: string,
  chainID: ChainId,
  assets: AssetWithMetadata[],
) {
  const client = await getStargateClientForChainID(chainID);
  const cosmwasmClient = await getCosmWasmClientForChainID(chainID);

  const balances = await client.getAllBalances(address);

  const cw20Assets = assets.filter((asset) => asset.isCW20);

  const cw20Balances = await Promise.all(
    cw20Assets.map((asset) => {
      return cosmwasmClient.queryContractSmart(asset.tokenContract as string, {
        balance: {
          address,
        },
      });
    }),
  );

  const allBalances = balances.reduce(
    (acc, balance) => {
      return {
        ...acc,
        [balance.denom]: balance.amount,
      };
    },
    {} as Record<string, string>,
  );

  cw20Balances.forEach((balance, index) => {
    const asset = cw20Assets[index];

    if (balance.balance !== "0") {
      allBalances[asset.denom] = balance.balance;
    }
  });

  return allBalances;
}

export function useBalancesByChain(
  address?: string,
  chain?: Chain,
  assets?: AssetWithMetadata[],
  enabled: boolean = true,
) {
  const publicClient = usePublicClient({
    chainId: chain?.chainType === "evm" ? parseInt(chain.chainID) : undefined,
  });

  const skipClient = useSkipClient();

  return useQuery({
    queryKey: ["balances-by-chain", address, chain, assets],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      if (chain.chainType === "evm") {
        return getEvmChainBalances(
          skipClient,
          publicClient,
          address,
          chain.chainID,
        );
      }

      return getBalancesByChain(address, chain.chainID, assets ?? []);
    },
    refetchInterval: 1000 * 5,
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
