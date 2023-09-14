import { PlusSmallIcon } from "@heroicons/react/20/solid";
import { FC } from "react";

interface Props {
  onClick?: () => void;
}

export const ConnectWalletButtonSmall: FC<Props> = ({ onClick }) => {
  return (
    <button
      className="bg-[#FF486E]/20 hover:bg-[#FF486E]/30 text-[#FF486E] text-xs font-semibold rounded-lg py-1 px-2.5 pr-1 flex items-center gap-1 transition-colors focus:outline-none"
      onClick={onClick}
    >
      <span>Connect Wallet</span>
      <PlusSmallIcon className="w-5 h-5" />
    </button>
  );
};
