import { GoogleTagManager } from "@next/third-parties/google";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import Head from "next/head";
import React from "react";

import { DefaultSeo } from "@/components/DefaultSeo";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  require("../styles/globals.css");

  return (
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          href={`/skip-favicon-96x96.png`}
          sizes="96x96"
        />
        <link
          rel="icon"
          type="image/svg+xml"
          href={`/skip-favicon.svg`}
        />
        <link
          rel="shortcut icon"
          href={`/skip-favicon.ico`}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`/skip-apple-touch-icon.png`}
        />
        <meta
          name="apple-mobile-web-app-title"
          content={"Skip Go"}
        />
        <link
          rel="manifest"
          href={`/skip-site.webmanifest`}
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
