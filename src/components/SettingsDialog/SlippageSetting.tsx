import { clsx } from "clsx";

import { useSettingsStore } from "@/context/settings";

const OPTION_VALUES = ["1", "3", "5"];

export const SlippageSetting = () => {
  const currentValue = useSettingsStore((state) => state.slippage);

  return (
    <div className="flex items-center p-2 space-x-2">
      <h3>Slippage</h3>
      <div className="flex-grow" />
      <div className="flex flex-col items-stretch gap-1 w-full max-w-32">
        <div className="relative text-sm">
          <input
            className={clsx(
              "border rounded-lg px-2 py-1 tabular-nums transition text-end",
              "number-input-arrows-hide pe-5 w-full",
            )}
            type="number"
            value={currentValue}
            min={0}
            max={100}
            onChange={(event) => {
              const value = Math.max(0, Math.min(100, +event.target.value));
              useSettingsStore.setState({ slippage: value.toString() });
            }}
          />
          <div className="absolute right-2 inset-y-0 flex items-center pointer-events-none">
            %
          </div>
        </div>
        <div className="grid grid-flow-col gap-1">
          {OPTION_VALUES.map((value, i) => (
            <button
              key={i}
              className={clsx(
                "border rounded-lg px-2 py-px tabular-nums text-xs transition",
                "text-neutral-600 hover:bg-neutral-100",
              )}
              onClick={() => useSettingsStore.setState({ slippage: value })}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
