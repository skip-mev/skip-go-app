import { SimpleTooltip } from "../SimpleTooltip";

export interface RouteEndProps {
  amount: string;
  symbol: string;
  chain: string;
  logo: string;
}

export const RouteEnd = ({ amount, symbol, logo, chain }: RouteEndProps) => {
  return (
    <div className="flex items-center gap-2">
      <div className="h-14 w-14 rounded-full border-2 border-neutral-200 bg-white p-1.5">
        <img
          className="h-full w-full"
          src={logo}
          alt={chain}
        />
      </div>
      <div className="font-semibold">
        <SimpleTooltip label={`${amount} ${symbol}`}>
          <div className="cursor-help tabular-nums underline decoration-neutral-400 decoration-dotted underline-offset-4">
            {parseFloat(amount).toLocaleString("en-US", { maximumFractionDigits: 8 })} {symbol}
          </div>
        </SimpleTooltip>
        <div className="text-sm text-neutral-400">On {chain}</div>
      </div>
    </div>
  );
};
