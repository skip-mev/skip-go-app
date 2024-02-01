import { useManager } from "@cosmos-kit/react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAccount as useWagmiAccount } from "wagmi";

import { useAccount } from "@/hooks/useAccount";
import { useChains } from "@/hooks/useChains";

export function useWalletAddresses(chainIDs: string[]) {
  const { data: chains = [] } = useChains();

  const { address: evmAddress } = useWagmiAccount();
  const { getWalletRepo } = useManager();

  const srcAccount = useAccount("source");
  const dstAccount = useAccount("destination");

  const queryKey = useMemo(() => ["USE_WALLET_ADDRESSES", chainIDs] as const, [chainIDs]);

  return useQuery({
    queryKey,
    queryFn: async ({ queryKey: [, chainIDs] }) => {
      const record: Record<string, string> = {};

      const srcChain = chains.find(({ chainID }) => {
        return chainID === chainIDs.at(0);
      });
      const dstChain = chains.find(({ chainID }) => {
        return chainID === chainIDs.at(-1);
      });

      for (const currentChainID of chainIDs) {
        const chain = chains.find(({ chainID }) => chainID === currentChainID);
        if (!chain) {
          throw new Error(`useWalletAddresses error: cannot find chain '${currentChainID}'`);
        }

        if (chain.chainType === "cosmos") {
          const { wallets } = getWalletRepo(chain.chainName);

          const currentWalletName = (() => {
            // if `chainID` is the source or destination chain
            if (srcChain?.chainID === currentChainID) {
              return srcAccount?.wallet?.walletName;
            }
            if (dstChain?.chainID === currentChainID) {
              return dstAccount?.wallet?.walletName;
            }

            // if `chainID` isn't the source or destination chain
            if (srcChain?.chainType === "cosmos") {
              return srcAccount?.wallet?.walletName;
            }
            if (dstChain?.chainType === "cosmos") {
              return dstAccount?.wallet?.walletName;
            }
          })();

          if (!currentWalletName) {
            throw new Error(`useWalletAddresses error: cannot find wallet for '${chain.chainName}'`);
          }

          const wallet = wallets.find(({ walletName }) => walletName === currentWalletName);
          if (!wallet) {
            throw new Error(`useWalletAddresses error: cannot find wallet for '${chain.chainName}'`);
          }
          if (wallet.isWalletDisconnected || !wallet.isWalletConnected) {
            await wallet.connect();
          }
          if (!wallet.address) {
            throw new Error(`useWalletAddresses error: cannot resolve wallet address for '${chain.chainName}'`);
          }
          record[currentChainID] = wallet.address;
        }

        if (chain.chainType === "evm") {
          if (!evmAddress) {
            throw new Error(`useWalletAddresses error: evm wallet not connected`);
          }
          record[currentChainID] = evmAddress;
        }
      }

      return record;
    },
  });
}
