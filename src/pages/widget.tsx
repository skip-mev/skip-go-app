import { SwapWidgetWithoutProviders } from "widgetv1";

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
          slippage: 3,
        }}
        onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET ? true : false}
      />
    </div>
  );
}
