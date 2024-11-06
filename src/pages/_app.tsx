import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";

import { DefaultSeo } from "@/components/DefaultSeo";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <>
      <DefaultSeo />
      <Analytics />
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </>
  );
}
