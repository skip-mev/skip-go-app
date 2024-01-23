import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  gasMultiplier: string;
  slippage: string;
}

export const defaultValues: SettingsStore = {
  gasMultiplier: (150_000).toString(),
  slippage: (3).toString(),
};

export const useSettingsStore = create<SettingsStore>()(
  persist(() => defaultValues, {
    name: "SettingsState",
    version: 2,
  }),
);
