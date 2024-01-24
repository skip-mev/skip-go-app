import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_GAS_AMOUNT } from "@/constants/gas";

interface SettingsStore {
  gasAmount: string;
  slippage: string;
}

export const defaultValues: SettingsStore = {
  gasAmount: DEFAULT_GAS_AMOUNT,
  slippage: (3).toString(),
};

export const useSettingsStore = create<SettingsStore>()(
  persist(() => defaultValues, {
    name: "SettingsState",
    version: 3,
  }),
);
