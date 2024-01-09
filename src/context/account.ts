import { create } from "zustand";
import { persist } from "zustand/middleware";

type TrackAccountStore = Record<string, string>;

const defaultValues: TrackAccountStore = {};

export const store = create(
  persist(() => defaultValues, {
    name: "TrackAccountState",
    version: 1,
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

export function useTrackAccount(chainID?: string) {
  return store((state) => state[chainID || ""]);
}
