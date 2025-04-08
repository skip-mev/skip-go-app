import { Widget } from "@skip-go/widget";
import { useState } from "react";

import DiscordButton from "@/components/DiscordButton";
import ShareButton from "@/components/ShareButton";
import { useTheme } from "@/hooks/useTheme";
import { useURLQueryParams } from "@/hooks/useURLQueryParams";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import { cn } from "@/utils/ui";

import { Banner } from "../Banner";
import cosmosStyles from "../cosmos/cosmos.module.css";
import { CosmosIcon } from "../cosmos/CosmosIcon";
import { ShareIcon } from "../cosmos/ShareIcon";
import { ThinArrowIcon } from "../cosmos/ThinArrowIcon";

export function CosmosPage() {
  const defaultRoute = useURLQueryParams();
  const theme = useTheme();
  const [queryParamsString, setQueryParamsString] = useState<string>();

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
        theme === "dark"
          ? "before:bg-[url(/cosmos-dark.jpg)]"
          : theme === "light"
            ? "before:bg-[url(/cosmos-light.jpg)]"
            : "",
      )}
    >
      <main className="relative flex min-h-screen flex-col items-center">
        <div className="z-10 flex w-full flex-row items-center justify-between px-8 py-8 xl:px-12 ">
          <CosmosIcon color={theme === "dark" ? "white" : "black"} />
          <div className="flex flex-row space-x-2">
            <ShareButton onClick={onClickedShareButton} />
            <DiscordButton />
          </div>
        </div>
        <div className="relative flex w-full flex-row items-center justify-center px-8 pb-8 xl:absolute xl:my-8">
          <div className={`z-10 ${cosmosStyles.cosmosBannerContainer}`}>
            <a
              href="https://cosmos.network/ibc-eureka"
              target="_blank"
              style={{
                color: "inherit",
                textDecoration: "inherit",
              }}
            >
              <div
                className={`${cosmosStyles.cosmosBannerBorder} ${
                  theme === "dark" ? cosmosStyles.darkBanner : cosmosStyles.lightBanner
                }`}
              >
                <ThinArrowIcon />
                IBC Eureka is live now! Use highlighted routes to bridge from Ethereum to Babylon and more.
                <ShareIcon />
              </div>
            </a>
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center">
          <div
            className="xl:absolute xl:-translate-y-1/2"
            style={{
              top: "50%",
              width: "100%",
              maxWidth: "500px",
              padding: "0 10px",
            }}
          >
            <Widget
              theme={theme}
              endpointOptions={endpointOptions}
              apiUrl={apiURL}
              defaultRoute={defaultRoute}
              onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
              enableSentrySessionReplays
              enableAmplitudeAnalytics
              onRouteUpdated={onRouteUpdated}
              routeConfig={{
                experimentalFeatures: ["hyperlane", "stargate", "eureka"],
              }}
              settings={{
                useUnlimitedApproval: true,
              }}
              disableShadowDom
              ibcEurekaHighlightedAssets={process.env.NEXT_PUBLIC_IBC_EUREKA_ASSETS?.split(",")}
              assetSymbolsSortedToTop={process.env.NEXT_PUBLIC_ASSET_SYMBOLS_SORTED_TO_TOP?.split(",")}
            />
          </div>
        </div>
        <div className="flex w-full items-center justify-center px-2 py-4 lg:fixed lg:bottom-0">
          <p className={`text-center text-[13px] opacity-50 ${theme === "dark" ? "text-white" : "text-black"}`}>
            <u>go.cosmos.network</u> {" is powered by Cosmos Hub, IBC Eureka & Skip:Go ❤️"}
          </p>
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
