interface Props {
  address: string;
  onClick: () => void;
  walletName: string;
  walletLogo?: string;
}

export function ConnectedWalletButton({
  address,
  onClick,
  walletLogo,
  walletName,
}: Props) {
  return (
    <button
      className="flex items-center gap-2 border border-neutral-300 hover:bg-neutral-50 rounded-lg py-2 px-2.5 focus:outline-none transition-colors"
      onClick={onClick}
    >
      {walletLogo && (
        <img alt={walletName} className="w-4 h-4" src={walletLogo} />
      )}
      <span className="text-xs font-bold">
        {address.slice(0, 8)}...{address.slice(-5)}
      </span>
    </button>
  );
}
