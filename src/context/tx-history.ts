import { RouteResponse } from "@skip-router/core";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { randomId } from "@/utils/random";

export interface TxStatus {
  chainId: string;
  txHash: string;
  explorerLink: string;
}

export interface TxHistoryItem {
  route: RouteResponse;
  txStatus: TxStatus[];
  timestamp: string;
  status: "pending" | "success" | "failed";
}

export type TxHistoryItemInput = Pick<TxHistoryItem, "route">;

export type TxHistoryState = Record<string, TxHistoryItem>;

export const useTxHistory = create(
  persist((): TxHistoryState => ({}), {
    name: "TxHistoryState",
    version: 1,
  }),
);

export const addTxHistory = (input: TxHistoryItemInput) => {
  const id = randomId();

  const newItem: TxHistoryItem = {
    txStatus: [],
    timestamp: new Date().toISOString(),
    status: "pending",
    ...input,
  };

  useTxHistory.setState((state) => ({
    ...state,
    [id]: newItem,
  }));

  return [id, newItem] as const;
};

export const failTxHistory = (id: string) => {
  useTxHistory.setState((state) => {
    const current = state[id];
    if (!current) return state;

    const latest: TxHistoryItem = {
      ...current,
      status: "failed",
    };

    return { ...state, [id]: latest };
  });
};

export const removeTxHistory = (id: string) => {
  useTxHistory.setState((state) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [id]: _, ...newState } = state;
    return newState;
  }, true);
};

export const addTxStatus = (id: string, txStatus: TxStatus) => {
  useTxHistory.setState((state) => {
    const current = state[id];
    if (!current) return state;

    const newTxStatus = current.txStatus.concat(txStatus);

    const latest: TxHistoryItem = {
      ...current,
      txStatus: newTxStatus,
      status:
        newTxStatus.length >= current.route.txsRequired ? "success" : "pending",
    };

    return { ...state, [id]: latest };
  });
};

export const clearTxHistory = () => {
  useTxHistory.setState({}, true);
};
