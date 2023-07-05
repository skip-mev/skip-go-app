import { FC, PropsWithChildren, useRef } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { DialogContext } from "./context";

interface Props extends PropsWithChildren {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const Dialog: FC<Props> = ({ children, open, onOpenChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <DialogContext.Provider value={{ open, onOpenChange, container: ref }}>
      <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
        {children}
        <div ref={ref} />
      </RadixDialog.Root>
    </DialogContext.Provider>
  );
};
