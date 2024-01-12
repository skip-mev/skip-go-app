import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type TrackAccountStore = Record<string, string>;

const defaultValues: TrackAccountStore = {};

const store = create(
  persist(() => defaultValues, {
    name: "TrackAccountState",
    version: 1,
    storage: createJSONStorage(() => window.sessionStorage),
  }),
);

export const trackAccount = {
  track: (chainID: string, walletName: string) => {
    store.setState({ [chainID]: walletName });
  },
  untrack: (chainID: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    store.setState(({ [chainID]: _, ...latest }) => latest, true);
  },
};

export function useTrackAccount(chainID?: string): string | undefined {
  return store((state) => state[chainID || ""]);
}

export function getTrackAccount(chainID?: string): string | undefined {
  return store.getState()[chainID || ""];
}
