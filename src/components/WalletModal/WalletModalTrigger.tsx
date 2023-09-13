/* eslint-disable @next/next/no-img-element */
import { useChain } from "@cosmos-kit/react";
import { ForwardedRef, forwardRef } from "react";

import { getChainByID } from "@/utils/utils";

function WalletModalTrigger(
  { chainID, ...props }: { chainID: string },
  ref: ForwardedRef<HTMLButtonElement>,
) {
  const { address, wallet } = useChain(getChainByID(chainID).chain_name);

  if (!address || !wallet) {
    return (
      <button
        className="bg-[#FF486E]/20 hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 pr-1 flex items-center gap-1 transition-colors  focus:outline-none"
        ref={ref}
        {...props}
      >
        <span>Connect Wallet</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M10.75 6.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 rounded py-2 px-2.5 focus:outline-none transition-colors"
      ref={ref}
      {...props}
    >
      {wallet.logo && (
        <img alt={wallet.prettyName} className="w-4 h-4" src={wallet.logo} />
      )}
      <span className="text-xs font-bold">
        {address.slice(0, 8)}...{address.slice(-5)}
      </span>
    </button>
  );
}

export default forwardRef(WalletModalTrigger);
