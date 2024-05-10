import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

import { TrackWalletCtx } from "@/context/track-wallet";

interface Wallet {
  walletName: string;
  walletPrettyName: string;
  walletInfo: {
    logo?:
      | string
      | {
          major: string;
          minor: string;
        };
  };
  isLedger?: boolean | null;
}

export type ChainAddresses = {
  chainID: string;
  chainType?: TrackWalletCtx;
  address?: string;
  source?: "input" | Wallet;
};

const defaultValues: Record<number, ChainAddresses | undefined> = {};

export const useChainAddressesStore = create(subscribeWithSelector(() => defaultValues));

export const chainAddresses = {
  reset: () => {
    useChainAddressesStore.setState(defaultValues);
  },
  init: (chainIDs: string[]) => {
    useChainAddressesStore.setState(defaultValues);
    useChainAddressesStore.setState(() => {
      const newState: Record<number, ChainAddresses> = {};
      chainIDs.forEach((chainID) => {
        newState[chainIDs.indexOf(chainID)] = {
          chainID,
        };
      });
      return newState;
    });
  },
  set: ({
    index,
    address,
    chainID,
    chainType,
    source,
  }: {
    index: number;
    chainID: string;
    chainType: TrackWalletCtx;
    address: string;
    source: "input" | Wallet;
  }) => {
    const current = useChainAddressesStore.getState()[index];
    if (current) {
      useChainAddressesStore.setState((state) => {
        return {
          ...state,
          [index]: {
            ...current,
            chainID,
            chainType,
            address,
            source,
          },
        };
      });
    } else {
      useChainAddressesStore.setState((state) => {
        return {
          ...state,
          [index]: {
            chainID,
            chainType,
            address,
            source,
          },
        };
      });
    }
  },
  get: (index: number) => {
    return useChainAddressesStore.getState()?.[index];
  },
};
