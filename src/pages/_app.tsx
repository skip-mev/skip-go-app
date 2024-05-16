import "@/styles/globals.css";

import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";

import { DefaultSeo } from "@/components/DefaultSeo";
import { Provider } from "@/widget";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo />
      <Analytics />
      <Provider>
        <Component {...pageProps} />
      </Provider>
    </>
  );
}
