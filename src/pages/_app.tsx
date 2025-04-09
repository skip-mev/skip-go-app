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
          href={isCosmosDomain ? "/cosmos-favicon.png" : "/skip-favicon.ico"}
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
