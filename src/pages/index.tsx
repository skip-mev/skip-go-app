import { SwapWidget } from "@skip-go/widget";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import { VersionCheck } from "@/components/VersionCheck";
import WidgetButton from "@/components/WidgetButton";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import { cn } from "@/utils/ui";

export default function Home() {
  const defaultRoute = useURLQueryParams();
  return (
    <div
      className={cn(
        "bg-[#ff86ff] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-[url(/bg.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo />
          <div className="flex flex-row space-x-2">
            <WidgetButton />
            <DiscordButton />
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center pt-16">
          <div className="relative w-screen overflow-hidden bg-white p-2 shadow-xl sm:max-w-[450px] sm:rounded-3xl">
            <SwapWidget
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
              colors={{
                primary: "#FF4FFF",
              }}
              endpointOptions={endpointOptions}
              apiURL={apiURL}
            />
          </div>
        </div>
      </main>
      <VersionCheck />
    </div>
  );
}
