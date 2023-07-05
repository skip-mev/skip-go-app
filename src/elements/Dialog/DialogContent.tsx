import { FC, Fragment, PropsWithChildren, useContext } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { DialogContentProps } from "@radix-ui/react-dialog";
import { Transition } from "@headlessui/react";
import { DialogContext } from "./context";

interface Props extends PropsWithChildren {
  onInteractOutside?: DialogContentProps["onInteractOutside"];
}

export const DialogContent: FC<Props> = ({ children, onInteractOutside }) => {
  const { open, container } = useContext(DialogContext);

  return (
    <RadixDialog.Portal container={container.current}>
      <Transition appear show={open}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-1000"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-300"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <RadixDialog.Content
            className="DialogContent absolute inset-0 bg-white z-[999]"
            onInteractOutside={onInteractOutside}
            style={{ zIndex: "999" }}
          >
            {children}
          </RadixDialog.Content>
        </Transition.Child>
      </Transition>
    </RadixDialog.Portal>
  );
};
