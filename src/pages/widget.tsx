import { SwapWidget } from "@skip-go/widget";

import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function WidgetPage() {
  const defaultRoute = useURLQueryParams();
  return (
    <div className="relative bg-white p-6 scrollbar-hide">
      <SwapWidget
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
        colors={{
          primary: "#FF4FFF",
        }}
        endpointOptions={endpointOptions}
        apiURL={apiURL}
      />
    </div>
  );
}
