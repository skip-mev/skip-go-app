import "@/styles/globals.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import React from "react";

import { DefaultSeo } from "@/components/DefaultSeo";

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
