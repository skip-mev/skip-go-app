import { SkipRouter } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { erc20ABI, PublicClient, usePublicClient } from "wagmi";

import { ChainId } from "@/chains/types";
import { multicall3ABI } from "@/constants/abis";
import { AssetWithMetadata } from "@/context/assets";
import { Chain } from "@/hooks/useChains";
import { useSkipClient } from "@/solve";
import { getCosmWasmClientForChainID, getStargateClientForChainID } from "@/utils/clients";

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
    queryKey: ["USE_BALANCES_BY_CHAIN", address, chain, assets],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      if (chain.chainType === "evm") {
        return getEvmChainBalances(skipClient, publicClient, address, chain.chainID);
      }

      return getBalancesByChain(address, chain.chainID, assets ?? []);
    },
    refetchInterval: 1000 * 5,
    enabled: !!chain && !!address && enabled,
  });
}

export async function getBalancesByChain(address: string, chainID: ChainId, assets: AssetWithMetadata[]) {
  const [stargate, cosmwasm] = await Promise.all([
    getStargateClientForChainID(chainID),
    getCosmWasmClientForChainID(chainID),
  ]);

  const balances = await stargate.getAllBalances(address);

  const cw20Assets = assets.filter((asset) => asset.isCW20);

  const cw20Balances = await Promise.all(
    cw20Assets.map((asset) => {
      return cosmwasm.queryContractSmart(asset.tokenContract!, {
        balance: { address },
      });
      }),
  );

  const allBalances = balances.reduce<Record<string, string>>(
    (acc, balance) => ({ ...acc, [balance.denom]: balance.amount }),
    {},
  );

  cw20Balances.forEach((balance, index) => {
    const asset = cw20Assets[index];
    if (balance.balance !== "0") {
      allBalances[asset.denom] = balance.balance;
    }
  });

  return allBalances;
}

export async function getEvmChainBalances(
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

  return chainAssets.reduce<Record<string, string>>(
    (acc, asset, i) => ({
      ...acc,
      [asset.denom]: balances[i].result?.toString() || "0",
    }),
    {},
  );
}
