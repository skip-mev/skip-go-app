import { SkipRouter } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { erc20ABI, PublicClient, usePublicClient } from "wagmi";

import { multicall3ABI } from "@/constants/abis";
import { Chain } from "@/context/chains";
import { useSkipClient } from "@/solve";
import { getStargateClientForChainID } from "@/utils/utils";

export function chainNameToChainlistURL(chainName: string) {
  const idToNameMap: Record<string, string> = {
    kichain: "ki-chain",
    fetchhub: "fetchai",
    mars: "mars-protocol",
    assetmantle: "asset-mantle",
    omniflixhub: "omniflix",
    gravitybridge: "gravity-bridge",
    terra2: "terra",
    cosmoshub: "cosmos",
    cryptoorgchain: "crypto-org",
  };

  const name = idToNameMap[chainName] || chainName;

  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${name}`;
}

export async function getBalancesByChain(address: string, chainID: string) {
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
    queryKey: ["balances-by-chain", address, chain?.chainID],
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
    refetchInterval: false,
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
  chainID: string,
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

  console.log(balances);

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
