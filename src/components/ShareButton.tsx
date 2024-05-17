import { ShareIcon } from "@heroicons/react/20/solid";
import * as Menubar from "@radix-ui/react-menubar";
import toast from "react-hot-toast";

import { cn } from "@/utils/ui";

import { SimpleTooltip } from "./SimpleTooltip";

export const ShareButton = ({ shareableLink }: { shareableLink: string }) => {
  return (
    <SimpleTooltip label="Share">
      <Menubar.Root>
        <Menubar.Menu>
          <Menubar.Trigger
            className={cn(
              "rounded-full p-2 text-black/80 hover:bg-neutral-100 hover:text-black/100",
              "transition-colors focus:outline-none",
            )}
          >
            <ShareIcon className="h-4 w-4" />
          </Menubar.Trigger>
          <Menubar.Portal>
            <Menubar.Content
              className={cn(
                "rounded-md bg-white leading-none",
                "select-none shadow shadow-neutral-500/50",
                "text-sm",
                "animate-slide-up-and-fade overflow-hidden",
              )}
            >
              <Menubar.Item>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-neutral-100"
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy as Link
                </button>
              </Menubar.Item>
              <Menubar.Separator />

              <Menubar.Item>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-neutral-100"
                  onClick={() => {
                    navigator.clipboard.writeText(shareableLink);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  Copy embeddable code
                </button>
              </Menubar.Item>
              <Menubar.Separator />
            </Menubar.Content>
          </Menubar.Portal>
        </Menubar.Menu>
      </Menubar.Root>
    </SimpleTooltip>
  );
};
