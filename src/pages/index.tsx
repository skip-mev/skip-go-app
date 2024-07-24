import { SwapWidget } from "@skip-go/widget";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import { VersionCheck } from "@/components/VersionCheck";
import WidgetButton from "@/components/WidgetButton";
// import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { cn } from "@/utils/ui";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function Home() {
  // const defaultRoute = useURLQueryParams();
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
          <div className="relative min-h-[650px] w-screen overflow-hidden bg-white p-2 shadow-xl sm:w-[450px] sm:rounded-3xl">
            <SwapWidget
              className=""
              settings={{
                customGasAmount: 200_000,
                slippage: 3,
              }}
              // endpointOptions={endpointOptions}
              // apiURL={apiURL}
              onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET ? true : false}
              theme={{
                brandColor: "#FF4FFF",
              }}
            />
          </div>
        </div>
      </main>
      {/* <VersionCheck /> */}
    </div>
  );
}
