import { CodeBracketIcon } from "@heroicons/react/20/solid";

import { disclosure } from "@/context/disclosures";
import { cn } from "@/utils/ui";

import { SimpleTooltip } from "./SimpleTooltip";

export const EmbedButton = () => {
  return (
    <SimpleTooltip label="Embed swap widget">
      <button
        onClick={() => disclosure.open("embedDialog")}
        className={cn(
          "rounded-full p-2 text-black/80 hover:bg-neutral-100 hover:text-black/100",
          "transition-colors focus:outline-none",
        )}
      >
        <CodeBracketIcon className="h-4 w-4" />
      </button>
    </SimpleTooltip>
  );
};
