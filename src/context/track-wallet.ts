import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type TrackWalletCtx = "source" | "destination";

interface TrackWalletStore {
  source?: {
    chainID: string;
    walletName: string;
  };
  destination?: {
    chainID: string;
    walletName: string;
  };
}

const defaultValues: TrackWalletStore = {
  source: undefined,
  destination: undefined,
};

const store = create(
  persist(() => defaultValues, {
    name: "TrackWalletState",
    version: 1,
    storage: createJSONStorage(() => window.sessionStorage),
  }),
);

export const trackWallet = {
  track: (ctx: TrackWalletCtx, chainID: string, walletName: string) => {
    store.setState({
      [ctx]: { chainID, walletName },
    });
  },
  untrack: (ctx: TrackWalletCtx) => {
    store.setState({
      [ctx]: undefined,
    });
  },
};

export function useTrackWallet(ctx: TrackWalletCtx) {
  return store((state) => state[ctx]);
}

export function getTrackWallet() {
  return store.getState();
}
