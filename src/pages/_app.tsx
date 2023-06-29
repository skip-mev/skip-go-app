import "../styles/globals.css";

import { Fragment } from "react";
import { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";

import Providers from "@/utils/provider";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Fragment>
      <Head>
        <title>ibc.fun</title>
        <meta name="description" content="ibc.fun" />
      </Head>
      <Providers>
        <main className={inter.className}>
          <Component {...pageProps} />
        </main>
      </Providers>
    </Fragment>
  );
}
