import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  gasAmount: string;
  slippage: string;
}

export const defaultValues: SettingsStore = {
  gasAmount: (200_000).toString(),
  slippage: (3).toString(),
};

export const useSettingsStore = create<SettingsStore>()(
  persist(() => defaultValues, {
    name: "SettingsState",
    version: 3,
  }),
);
