import { ForwardedRef, forwardRef } from "react";

interface Props {
  disabled?: boolean;
}

const TransactionDialogTrigger = forwardRef(function TransactionDialogTrigger(
  { disabled, ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <button
      className="bg-[#FF486E] text-white font-semibold py-4 rounded-md w-full transition-transform enabled:hover:scale-105 enabled:hover:rotate-1 disabled:cursor-not-allowed disabled:opacity-75 outline-none"
      ref={ref}
      disabled={disabled}
      {...props}
    >
      Submit
    </button>
  );
});

export default TransactionDialogTrigger;
