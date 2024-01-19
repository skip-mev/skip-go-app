import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";

export type TrackWalletCtx = "source" | "destination";

interface TrackWalletStore {
  source?: {
    chainID: string;
    walletName: string;
    chainType: string;
  };
  destination?: {
    chainID: string;
    walletName: string;
    chainType: string;
  };
}

const defaultValues: TrackWalletStore = {
  source: undefined,
  destination: undefined,
};

const useStore = create(
  subscribeWithSelector(
    persist(() => defaultValues, {
      name: "TrackWalletState",
      version: 1,
      storage: createJSONStorage(() => window.sessionStorage),
    }),
  ),
);

export const trackWallet = {
  track: (ctx: TrackWalletCtx, chainID: string, walletName: string, chainType: string) => {
    useStore.setState({
      [ctx]: { chainID, walletName, chainType },
    });
  },
  untrack: (ctx: TrackWalletCtx) => {
    useStore.setState({
      [ctx]: undefined,
    });
  },
  get: useStore.getState,
  subscribe: useStore.subscribe,
};

export function useTrackWallet(ctx: TrackWalletCtx) {
  return useStore((state) => state[ctx]);
}
