import { SwapWidgetWithoutProviders } from "@skip-go/widget";

import { useURLQueryParams } from "@/hooks/useURLQueryParams";

export default function WidgetPage() {
  const defaultRoute = useURLQueryParams();
  return (
    <div className="relative bg-white p-6 scrollbar-hide">
      <SwapWidgetWithoutProviders
        className=""
        defaultRoute={{
          srcChainID: defaultRoute?.srcChain,
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
