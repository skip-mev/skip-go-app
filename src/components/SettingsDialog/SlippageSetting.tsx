import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { ComponentProps, useEffect, useRef, useState } from "react";

import { defaultValues, useSettingsStore } from "@/context/settings";

const OPTION_VALUES = ["1", "3", "5"];

export const SlippageSetting = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const currentValue = useSettingsStore((state) => state.slippage);

  const [custom, setCustom] = useState(() => false);

  const toggleCustom = () =>
    setCustom((prev) => {
      const latest = !prev;
      if (!latest) {
        useSettingsStore.setState({ slippage: defaultValues.slippage });
      }
      return latest;
    });

  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (custom) ref.current?.focus();
  }, [custom]);

  return (
    <div
      className={clsx("flex items-center p-2 space-x-2", className)}
      {...props}
    >
      <h3>Slippage</h3>
      <div className="flex-grow" />
      {custom ? (
        <input
          className="border rounded-lg px-2 py-1 tabular-nums text-sm transition"
          type="number"
          value={currentValue}
          min={0}
          max={100}
          onChange={(event) => {
            useSettingsStore.setState({ slippage: event.target.value });
          }}
          ref={ref}
        />
      ) : (
        <ToggleGroup.Root
          className="flex items-center space-x-1"
          type="single"
          value={currentValue}
          aria-label="slippage"
        >
          {OPTION_VALUES.map((value, i) => (
            <ToggleGroup.Item
              key={i}
              value={value}
              aria-label={`${value}%`}
              className={clsx(
                "border rounded-lg px-2 py-1 tabular-nums text-sm transition",
                "hover:bg-gray-100",
                "data-[state=on]:border-blue-400 data-[state=on]:bg-blue-50",
                "data-[state=on]:ring-1 ring-inset ring-blue-400",
              )}
              onClick={() => useSettingsStore.setState({ slippage: value })}
            >
              {value}%
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      )}
      <button
        className={clsx(
          "border rounded-lg px-2 py-1 tabular-nums text-sm transition scrol",
          "hover:bg-gray-100",
          "data-[state=on]:border-blue-400 data-[state=on]:bg-blue-50",
          "data-[state=on]:ring-1 ring-inset ring-blue-400",
        )}
        onClick={toggleCustom}
      >
        {custom ? "Revert" : "Custom"}
      </button>
    </div>
  );
};
