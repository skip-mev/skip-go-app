import "@/styles/globals.css";

import { SwapWidgetProvider } from "@skip-go/widget";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";

import { DefaultSeo } from "@/components/DefaultSeo";
import { apiURL, endpointOptions, praxWallet } from "@/lib/skip-go-widget";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo />
      <Analytics />
      <SwapWidgetProvider
        endpointOptions={endpointOptions}
        apiURL={apiURL}
        makeDestinationWallets={(chainID) => {
          if (chainID.includes("penumbra")) {
            return [praxWallet];
          }
          return [];
        }}
      >
        <Component {...pageProps} />
      </SwapWidgetProvider>
    </>
  );
}
