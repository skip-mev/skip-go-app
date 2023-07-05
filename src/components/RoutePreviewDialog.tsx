import { FC, PropsWithChildren, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/elements/Dialog";
import RoutePreview from "./RoutePreview";

const RoutePreviewDialog: FC<PropsWithChildren> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger>{children}</DialogTrigger>
      <DialogContent>
        <RoutePreview />
      </DialogContent>
    </Dialog>
  );
};

export default RoutePreviewDialog;
