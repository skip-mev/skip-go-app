import { clsx } from "clsx";

import { useSettingsStore } from "@/context/settings";

const OPTION_VALUES = ["1", "3", "5"];

export const SlippageSetting = () => {
  const currentValue = useSettingsStore((state) => state.slippage);

  return (
    <div className="flex items-center space-x-2 p-2">
      <h3>Slippage</h3>
      <div className="flex-grow" />
      <div className="flex w-full max-w-32 flex-col items-stretch gap-1">
        <div className="relative text-sm">
          <input
            className={clsx(
              "rounded-lg border px-2 py-1 text-end tabular-nums transition",
              "w-full pe-5 number-input-arrows-hide",
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
          <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">%</div>
        </div>
        <div className="grid grid-flow-col gap-1">
          {OPTION_VALUES.map((value, i) => (
            <button
              key={i}
              className={clsx(
                "rounded-lg border px-2 py-px text-xs tabular-nums transition",
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
