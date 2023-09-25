import { useQuery } from "@tanstack/react-query";
import { getContract } from "viem";
import { erc20ABI, useAccount, usePublicClient } from "wagmi";

import { Chain } from "@/context/chains";
import { useSkipClient } from "@/solve";
import { getStargateClientForChainID, isEVMChain } from "@/utils/utils";

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
  const { address: evmAddress } = useAccount();
  const skipClient = useSkipClient();
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["balances-by-chain", address, chain?.chainID, evmAddress],
    queryFn: async () => {
      if (!chain || !address) {
        return {};
      }

      if (isEVMChain(chain.chainID)) {
        if (!evmAddress) {
          return {};
        }

        const chainAssets = await skipClient.assets({
          chainID: chain.chainID,
        });

        const balances: Record<string, string> = {};

        const balanceResults = await Promise.all(
          chainAssets[chain.chainID].map(async (chainAsset) => {
            if (!chainAsset.tokenContract) {
              return publicClient.getBalance({
                address: evmAddress,
              });
            }

            const contract = getContract({
              abi: erc20ABI,
              address: chainAsset.tokenContract as `0x${string}`,
              publicClient,
            });

            return contract.read.balanceOf([evmAddress]);
          }),
        );

        chainAssets[chain.chainID].forEach((chainAsset, index) => {
          balances[chainAsset.denom] = balanceResults[index].toString();
        });

        return balances;
      }

      const balances = await getBalancesByChain(address, chain.chainID);

      return balances;
    },
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    keepPreviousData: true,
    enabled: !!chain && !!address && enabled,
  });
}
