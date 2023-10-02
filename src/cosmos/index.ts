import { SkipRouter } from "@skip-router/core";
import { useQuery } from "@tanstack/react-query";
import { multicall3Abi } from "viem";
import { erc20ABI, PublicClient, usePublicClient } from "wagmi";

import { Chain } from "@/context/chains";
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

  return useQuery({
    queryKey: ["balances-by-chain", address, chain?.chainID],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      if (chain.chainType === "evm") {
        return getEvmChainBalances(publicClient, address, chain.chainID);
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
  publicClient: PublicClient,
  address: string,
  chainID: string,
) {
  const skipClient = new SkipRouter("https://solve-dev.skip.money");

  const assets = await skipClient.assets({
    chainID,
    includeEvmAssets: true,
  });

  const chainAssets = assets[chainID];

  // const erc20Assets = chainAssets.filter(
  //   (asset) => typeof asset.tokenContract !== "undefined",
  // );

  // const erc20Balances = await publicClient.multicall({
  //   contracts: erc20Assets.map((asset) => ({
  //     address: asset.tokenContract as `0x${string}`,
  //     abi: erc20ABI,
  //     functionName: "balanceOf",
  //     args: [address as `0x${string}`],
  //   })),
  // });

  // console.log(erc20Balances);

  console.log(publicClient);

  const balances = await publicClient.multicall({
    contracts: chainAssets.map((asset) => {
      if (!asset.tokenContract) {
        return {
          address: "0xcA11bde05977b3631167028862bE2a173976CA11",
          abi: multicall3Abi,
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

  // for (const asset of chainAssets) {
  //   if (asset.tokenContract) {
  //     const response = await publicClient.readContract({
  //       address: asset.tokenContract as `0x${string}`,
  //       abi: erc20ABI,
  //       functionName: "balanceOf",
  //       args: [address as `0x${string}`],
  //     });

  //     console.log(response);
  //   }
  //   // publicClient.multicall({
  //   //   contracts
  //   // })
  // }
}
