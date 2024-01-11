import { clsx } from "clsx";

import { useSettingsStore } from "@/context/settings";

export const GasSetting = () => {
  const currentValue = useSettingsStore((state) => state.gas);

  return (
    <div className="flex items-center p-2 space-x-2">
      <h3>Gas</h3>
      <div className="flex-grow" />
      <div className="flex flex-col items-stretch gap-1 w-full max-w-32">
        <div className="relative text-sm">
          <input
            className={clsx(
              "border rounded-lg px-2 py-1 tabular-nums transition text-end",
              "number-input-arrows-hide w-full",
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
