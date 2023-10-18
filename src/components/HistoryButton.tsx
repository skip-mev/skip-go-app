import { clsx } from "clsx";
import { ComponentProps } from "react";

import { HistoryIcon } from "./HistoryIcon";

export const HistoryButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      className={clsx(
        "p-2 rounded text-black/80 hover:text-black/100",
        "focus:outline-none transition-colors",
        className,
      )}
      role="group"
      {...props}
    >
      <HistoryIcon className="w-4 h-4" />
    </button>
  );
};
