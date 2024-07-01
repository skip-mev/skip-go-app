import "@skip-go/widget/style.css";

import { SwapWidget } from "@skip-go/widget";

import { useURLQueryParams } from "@/hooks/useURLQueryParams";

export default function WidgetPage() {
  const defaultRoute = useURLQueryParams();
  return (
    <div className="relative bg-white p-6 scrollbar-hide">
      <SwapWidget
        className=""
        defaultRoute={{
          srcChainID: defaultRoute?.srcChain || "cosmoshub-4",
          srcAssetDenom: defaultRoute?.srcAssetDenom,
          destChainID: defaultRoute?.destChain,
          destAssetDenom: defaultRoute?.destAssetDenom,
          amountIn: Number(defaultRoute?.amountIn),
          amountOut: Number(defaultRoute?.amountOut),
        }}
        settings={{
          customGasAmount: 200_000,
          slippage: 3,
        }}
        onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET ? true : false}
      />
    </div>
  );
}
