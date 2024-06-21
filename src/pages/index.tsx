import dynamic from "next/dynamic";
import { Suspense } from "react";

import Header from "@/components/Header";
import { Help } from "@/components/Help";
import SkipBanner from "@/components/SkipBanner";
import { VersionCheck } from "@/components/VersionCheck";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { cn } from "@/utils/ui";

export default function Home() {
  const defaultRoute = useURLQueryParams();

  const Widget = dynamic(() => import("@skip-go/widget").then((res) => res.SwapWidget));
  return (
    <div
      className={cn(
        "bg-[#ffdc61] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[80vh] before:content-['']",
        "before:bg-[url(/site-bg-2.svg)] before:bg-cover before:bg-[center_top] before:bg-no-repeat",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center sm:pt-11">
        <SkipBanner className="z-9 inset-x-0 top-0 w-screen sm:fixed" />
        <Header />
        <div className="flex flex-grow flex-col items-center">
          <div className="relative w-screen overflow-hidden bg-white p-2 shadow-xl sm:max-w-[450px] sm:rounded-3xl">
            <Suspense fallback={<div>Loading...</div>}>
              <Widget
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
            </Suspense>
          </div>
        </div>
      </main>
      <VersionCheck />
      <Help />
    </div>
  );
}
