import { clsx } from "clsx";

import { useSettingsStore } from "@/context/settings";

export const GasSetting = () => {
  const currentValue = useSettingsStore((state) => state.gas);

  return (
    <div className="flex items-center space-x-2 p-2">
      <h3>Gas</h3>
      <div className="flex-grow" />
      <div className="flex w-full max-w-32 flex-col items-stretch gap-1">
        <div className="relative text-sm">
          <input
            className={clsx(
              "rounded-lg border px-2 py-1 text-end tabular-nums transition",
              "w-full number-input-arrows-hide",
            )}
            type="number"
            value={currentValue}
            min={0}
            onChange={(event) => {
              const value = Math.max(0, +event.target.value);
              useSettingsStore.setState({ gas: value.toString() });
            }}
          />
        </div>
      </div>
    </div>
  );
};
