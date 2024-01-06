import * as Dialog from "@radix-ui/react-dialog";
import { DialogContentProps } from "@radix-ui/react-dialog";
import { PropsWithChildren, useContext } from "react";

import { DialogContext } from "./context";

interface Props extends PropsWithChildren {
  onInteractOutside?: DialogContentProps["onInteractOutside"];
}

export function DialogContent({ children, onInteractOutside }: Props) {
  const { open, container } = useContext(DialogContext);

  if (!open) return null;

  return (
    <Dialog.Portal container={container.current}>
      <Dialog.Content
        className="absolute inset-0 bg-white rounded-3xl z-[999] animate-fade-zoom-in"
        onInteractOutside={onInteractOutside}
      >
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}
