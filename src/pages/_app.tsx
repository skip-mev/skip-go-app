import { GoogleTagManager } from "@next/third-parties/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

import { DefaultSeo } from "@/components/DefaultSeo";

export const isCosmosDomain = process.env.NEXT_PUBLIC_COSMOS_DOMAIN === "true";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  isCosmosDomain ? require("../styles/cosmosGlobals.css") : require("../styles/globals.css");

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href={`/${isCosmosDomain ? "cosmos-" : "skip-"}favicon-96x96.png`}
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/${isCosmosDomain ? "cosmos-" : "skip-"}favicon.svg`}
        />
        <link
          rel="shortcut icon"
          href={`/${isCosmosDomain ? "cosmos-" : "skip-"}favicon.ico`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/${isCosmosDomain ? "cosmos-" : "skip-"}apple-touch-icon.png`}
        />
        <meta
          name="apple-mobile-web-app-title"
          content={isCosmosDomain ? "IBC Eureka" : "Skip Go"}
        />
        <link
          rel="manifest"
          href={`/${isCosmosDomain ? "cosmos-" : "skip-"}site.webmanifest`}
        />
      </Head>
      <DefaultSeo />
      <GoogleTagManager gtmId="GTM-5XMZ695Z" />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>

      <Analytics />
    </>
  );
}
