import { clsx } from "clsx";
import { ComponentProps, forwardRef } from "react";

type Props = ComponentProps<"button"> & {
  address: string;
  walletName: string;
  walletLogo?: string;
};

export const ConnectedWalletButton = forwardRef<HTMLButtonElement, Props>(
  function Component(props, ref) {
    const { address, walletLogo, walletName, ...rest } = props;
    return (
      <button
        className={clsx(
          "flex items-center gap-2 focus:outline-none transition-colors",
          "border border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 rounded-lg py-2 px-2.5",
        )}
        {...rest}
        ref={ref}
      >
        {walletLogo && (
          <img alt={walletName} className="w-4 h-4" src={walletLogo} />
        )}
        <span className="text-xs font-bold tabular-nums">
          {address.slice(0, 8)}...{address.slice(-5)}
        </span>
      </button>
    );
  },
  //
);
