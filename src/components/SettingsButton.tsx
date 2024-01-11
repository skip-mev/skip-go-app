import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { ComponentProps } from "react";

import { disclosure } from "@/context/disclosures";

import { SimpleTooltip } from "./SimpleTooltip";

export const SettingsButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <SimpleTooltip label="Swap Settings">
      <button
        className={clsx(
          "p-2 rounded-full text-black/80 hover:text-black/100 hover:bg-neutral-100",
          "focus:outline-none transition-colors",
          className,
        )}
        onClick={() => disclosure.open("settingsDialog")}
        role="group"
        {...props}
      >
        <Cog6ToothIcon className="w-4 h-4" />
      </button>
    </SimpleTooltip>
  );
};
