import { ArrowLeftIcon } from "@heroicons/react/20/solid";
import * as Dialog from "@radix-ui/react-dialog";
import * as ScrollArea from "@radix-ui/react-scroll-area";

import { useDisclosureKey } from "@/context/disclosures";
import { cn } from "@/utils/ui";

export const EmbedDialog = () => {
  const [isOpen, { close }] = useDisclosureKey("embedDialog");
  return (
    <Dialog.Root
      modal
      open={isOpen}
    >
      <Dialog.Content className="absolute inset-0 animate-fade-zoom-in rounded-3xl bg-white">
        <div className="flex h-full flex-col space-y-2 px-4 py-6">
          <div className="flex items-center gap-4 pb-2">
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-neutral-100"
              onClick={close}
            >
              <ArrowLeftIcon className="h-6 w-6" />
            </button>
            <h3 className="text-xl font-bold">Embed Swap Widget</h3>
            <div className="flex-grow" />
          </div>
          <ScrollArea.Root
            className={cn(
              "relative isolate -mx-4 overflow-hidden",
              "before:absolute before:inset-x-0 before:bottom-0 before:z-10 before:h-2",
              "before:bg-gradient-to-t before:from-white before:to-transparent",
            )}
          >
            <ScrollArea.Viewport className="h-full w-full px-4"></ScrollArea.Viewport>
            <ScrollArea.Scrollbar
              className="z-20 flex touch-none select-none transition-colors ease-out data-[orientation=horizontal]:h-2 data-[orientation=vertical]:w-2 data-[orientation=horizontal]:flex-col"
              orientation="vertical"
            >
              <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-neutral-500/50 transition-colors before:absolute before:left-1/2 before:top-1/2 before:h-2 before:w-2 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-neutral-500" />
            </ScrollArea.Scrollbar>
            <ScrollArea.Corner />
          </ScrollArea.Root>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
};