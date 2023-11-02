import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  slippage: string;
}

export const defaultValues: SettingsStore = {
  slippage: "3",
};

export const useSettingsStore = create<SettingsStore>()(
  persist(() => defaultValues, {
    name: "SettingsStore",
  }),
);
