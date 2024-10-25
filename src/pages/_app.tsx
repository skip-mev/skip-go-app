import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import { SwapWidgetProvider } from "widgetv1";

import { DefaultSeo } from "@/components/DefaultSeo";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo />
      <Analytics />
      <SwapWidgetProvider
        endpointOptions={endpointOptions}
        apiURL={apiURL}
      >
        <Component {...pageProps} />
      </SwapWidgetProvider>
    </>
  );
}
