import { clsx } from "clsx";
import { ComponentProps } from "react";

export const Root = ({ className, ...props }: ComponentProps<"dl">) => {
  return (
    <dl
      className={clsx("divide-y text-start text-sm", className)}
      {...props}
    />
  );
};

export const Row = ({ className, ...props }: ComponentProps<"div">) => {
  return (
    <div
      className={clsx("grid grid-cols-3 p-2", className)}
      {...props}
    />
  );
};

export const Dt = ({ className, ...props }: ComponentProps<"dt">) => {
  return (
    <dt
      className={clsx("col-span-1 flex items-center text-black/60", className)}
      {...props}
    />
  );
};

export const Dd = ({ className, ...props }: ComponentProps<"dd">) => {
  return (
    <dd
      className={clsx("col-span-2", className)}
      {...props}
    />
  );
};
