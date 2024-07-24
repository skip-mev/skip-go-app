import { SwapWidget } from "@skip-go/widget";

import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function WidgetPage() {
  // const defaultRoute = useURLQueryParams();
  return (
    <div className="relative bg-white p-6 scrollbar-hide">
      <SwapWidget
        className=""
        endpointOptions={endpointOptions}
        apiURL={apiURL}
        settings={{
          customGasAmount: 200_000,
          slippage: 3,
        }}
        onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET ? true : false}
      />
    </div>
  );
}
