import { Cog6ToothIcon } from "@heroicons/react/20/solid";
import * as Tooltip from "@radix-ui/react-tooltip";
import { clsx } from "clsx";
import { ComponentProps } from "react";

import { disclosure } from "@/context/disclosures";

export const SettingsButton = ({
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          className={clsx(
            "p-2 rounded-full text-black/80 hover:text-black/100 hover:bg-gray-100",
            "focus:outline-none transition-colors",
            className,
          )}
          onClick={() => disclosure.open("settingsDialog")}
          role="group"
          {...props}
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className={clsx(
            "rounded-md bg-white px-4 py-2 leading-none",
            "select-none shadow z-[9999]",
            "text-sm",
          )}
        >
          Swap Settings
          <Tooltip.Arrow className="fill-white" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
