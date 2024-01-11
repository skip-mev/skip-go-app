import { PlusIcon } from "@heroicons/react/20/solid";
import { clsx } from "clsx";
import { ComponentProps } from "react";

export function ConnectWalletButtonSmall({
  className,
  ...props
}: ComponentProps<"button">) {
  return (
    <button
      className={clsx(
        "bg-[#FF486E]/20 hover:bg-[#FF486E]/30 text-[#FF486E]",
        "text-xs font-semibold rounded-md py-1 px-2.5 pr-1 flex items-center gap-1 transition-colors focus:outline-none",
        className,
      )}
      {...props}
    >
      <span>Connect Wallet</span>
      <PlusIcon className="w-4 h-4" />
    </button>
  );
}
