interface Props {
  numberOfTransactions: number;
}

export default function RouteTransactionCountBanner({ numberOfTransactions }: Props) {
  return (
    <div className="flex w-full items-center rounded-md bg-black p-3 text-left text-xs font-medium uppercase text-white/50">
      <p className="flex-1">
        This route requires {numberOfTransactions === 1 && <span className="text-white">1 Transaction</span>}
        {numberOfTransactions > 1 && <span className="text-white">{numberOfTransactions} Transactions</span>} to
        complete
      </p>
    </div>
  );
}
