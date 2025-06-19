import { SwapWidgetWithoutProviders } from "widgetv1";
import { SwapWidgetProvider } from "widgetv1";

import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function WidgetPage() {
  const defaultRoute = useURLQueryParams();
  return (
    <SwapWidgetProvider
      endpointOptions={endpointOptions}
      apiURL={apiURL}
    >
      <div className="relative bg-white p-6 scrollbar-hide">
        <SwapWidgetWithoutProviders
          className=""
          defaultRoute={{
            srcChainID: defaultRoute?.srcChainId,
            srcAssetDenom: defaultRoute?.srcAssetDenom,
            destChainID: defaultRoute?.destChainId,
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
    </SwapWidgetProvider>
  );
}
