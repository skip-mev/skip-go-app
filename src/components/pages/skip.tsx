import { Widget } from "@skip-go/widget";
import { useState } from "react";

import DiscordButton from "@/components/DiscordButton";
import { LogoGo } from "@/components/LogoGo";
import ShareButton from "@/components/ShareButton";
import WidgetButton from "@/components/WidgetButton";
// import { useFeatureEnabled } from "@/hooks/useFeatureEnabled";
import { useTheme } from "@/hooks/useTheme";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import { cn } from "@/utils/ui";

import { Banner } from "../Banner";

export function SkipPage() {
  const defaultRoute = useURLQueryParams();
  const theme = useTheme();
  const [queryParamsString, setQueryParamsString] = useState<string>();

  const showLedgerMainnet = process.env.NEXT_PUBLIC_SHOW_LEDGER_MAINNET === "true";

  const onClickedShareButton = () => {
    if (queryParamsString) {
      navigator.clipboard.writeText(`${window.location.origin}?${queryParamsString}`);
      window.history.replaceState({}, "", `${window.location.pathname}?${queryParamsString}`);
    }
  };

  const onRouteUpdated = (props: {
    srcChainId?: string;
    srcAssetDenom?: string;
    destChainId?: string;
    destAssetDenom?: string;
    amountIn?: string;
    amountOut?: string;
  }) => {
    const params = new URLSearchParams({
      src_asset: props?.srcAssetDenom ?? "",
      src_chain: props?.srcChainId ?? "",
      dest_asset: props?.destAssetDenom ?? "",
      dest_chain: props?.destChainId ?? "",
      amount_in: props?.amountIn ?? "",
      amount_out: props?.amountOut ?? "",
    });

    const queryString = params.toString();

    setQueryParamsString(queryString);
  };

  if (!theme) return null;
  return (
    <div
      className={cn(
        "bg-[#191919] font-sans subpixel-antialiased",
        "relative overflow-x-hidden overflow-y-hidden",
        "before:fixed before:inset-x-0 before:bottom-0 before:h-[100vh] before:content-['']",
        "before:bg-cover before:bg-[center_top] before:bg-no-repeat",
        theme === "dark" ? "before:bg-[url(/dark-bg.svg)]" : theme === "light" ? "before:bg-[url(/light-bg.svg)]" : "",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="flex h-20 w-full flex-row items-center justify-between px-6 py-4">
          <LogoGo color={theme === "dark" ? "white" : "black"} />
          <div className="flex flex-row space-x-2">
            <ShareButton onClick={onClickedShareButton} />
            <WidgetButton />
            <DiscordButton />
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center">
          <div className="widget-container">
            <Widget
              theme={theme}
              endpointOptions={endpointOptions}
              apiUrl={apiURL}
              defaultRoute={defaultRoute}
              onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
              enableSentrySessionReplays
              enableAmplitudeAnalytics
              disableShadowDom
              onRouteUpdated={onRouteUpdated}
              routeConfig={{
                experimentalFeatures: ["hyperlane", "stargate", "eureka", "layer_zero"],
              }}
              settings={{
                useUnlimitedApproval: true,
              }}
              filterOut={{
                source: {
                  1: ["0xFEC6a341F9B7e30E30Ef5B990158FA539B6bb057"],
                  ...(showLedgerMainnet ? {} : { "ledger-mainnet-1": undefined }),
                },
                destination: {
                  1: ["0xFEC6a341F9B7e30E30Ef5B990158FA539B6bb057", "0xbf45a5029d081333407cc52a84be5ed40e181c46"],
                  "pacific-1": ["ibc/6C00E4AA0CC7618370F81F7378638AE6C48EFF8C9203CE1C2357012B440EBDB7"],
                  "1329": ["0xB75D0B03c06A926e488e2659DF1A861F860bD3d1"],
                  ...(showLedgerMainnet ? {} : { "ledger-mainnet-1": undefined }),
                },
              }}
              filterOutUnlessUserHasBalance={{
                source: {
                  "1": ["0xbf45a5029d081333407cc52a84be5ed40e181c46"],
                  "1329": ["0xB75D0B03c06A926e488e2659DF1A861F860bD3d1"],
                },
              }}
              hideAssetsUnlessWalletTypeConnected={true}
            />
          </div>
        </div>
        {process.env.NEXT_PUBLIC_SHOW_BANNER === "true" &&
        process.env.NEXT_PUBLIC_BANNER_MESSAGE &&
        process.env.NEXT_PUBLIC_BANNER_TITLE ? (
          <Banner />
        ) : null}
      </main>
    </div>
  );
}
