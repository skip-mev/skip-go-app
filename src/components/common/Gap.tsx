import { ComponentProps } from "react";

import { cn } from "@/utils/ui";

export const Gap = {
  Parent({ className, ...props }: ComponentProps<"div">) {
    return (
      <div
        className={cn("flex flex-wrap items-center gap-x-2 gap-y-1", className)}
        {...props}
      />
    );
  },
  Child({ className, ...props }: ComponentProps<"div">) {
    return (
      <div
        className={cn("flex items-center gap-x-1 gap-y-1", className)}
        {...props}
      />
    );
  },
};
