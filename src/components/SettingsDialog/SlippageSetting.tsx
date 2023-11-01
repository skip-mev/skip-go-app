import * as ToggleGroup from "@radix-ui/react-toggle-group";
import { clsx } from "clsx";
import { ComponentProps } from "react";

import { useSettingsStore } from "@/context/settings";

const OPTION_VALUES = ["1", "2.5", "3", "5"];

export const SlippageSetting = ({
  className,
  ...props
}: ComponentProps<"div">) => {
  const currentValue = useSettingsStore((state) => state.slippage);
  return (
    <div className={clsx("flex items-center p-2", className)} {...props}>
      <h3>Slippage</h3>
      <div className="flex-grow" />
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
    </div>
  );
};
