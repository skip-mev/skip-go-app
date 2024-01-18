import { PlusIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { ComponentProps } from "react";

export function ConnectWalletButtonSmall({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "bg-[#FF486E]/20 text-[#FF486E] hover:bg-[#FF486E]/30",
        "flex items-center gap-1 rounded-md px-2.5 py-1 pr-1 text-xs font-semibold transition-colors focus:outline-none",
        className,
      )}
      {...props}
    >
      <span>Connect Wallet</span>
      <PlusIcon className="h-4 w-4" />
    </button>
  );
}
