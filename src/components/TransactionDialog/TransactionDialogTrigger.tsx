import { ForwardedRef, forwardRef } from "react";

interface Props {
  disabled?: boolean;
}

const TransactionDialogTrigger = forwardRef(function TransactionDialogTrigger(
  { disabled, ...props }: Props,
  ref: ForwardedRef<HTMLButtonElement>,
) {
  return (
    <button
      className="w-full rounded-md bg-[#FF486E] py-4 font-semibold text-white outline-none transition-transform enabled:hover:rotate-1 enabled:hover:scale-105 disabled:cursor-not-allowed disabled:opacity-75"
      ref={ref}
      disabled={disabled}
      {...props}
    >
      Submit
    </button>
  );
});

export default TransactionDialogTrigger;
