import "@fontsource/jost/latin.css";
import "@/styles/globals.css";

import { ChainProvider } from "@cosmos-kit/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import { ComponentProps } from "react";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { DefaultSeo } from "@/components/DefaultSeo";
import Header from "@/components/Header";
import SkipBanner from "@/components/SkipBanner";
import { AssetsProvider } from "@/context/assets";
import { wallets } from "@/lib/cosmos-kit";
import { persister, queryClient } from "@/lib/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { SkipProvider } from "@/solve";

type ChainProviderProps = ComponentProps<typeof ChainProvider>;

const assets = getAssetLists() as ChainProviderProps["assetLists"];
const chains = getChains() as ChainProviderProps["chains"];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <DefaultSeo />
      <Analytics />
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ChainProvider
          assetLists={assets}
          chains={chains}
          sessionOptions={{
            duration: 1000 * 60 * 60 * 24, // 1 day
          }}
          throwErrors={false}
          wallets={wallets}
        >
          <WagmiConfig config={wagmiConfig}>
            <SkipProvider>
              <AssetsProvider>
                <main className="min-h-screen flex flex-col items-center relative sm:pt-11">
                  <SkipBanner className="z-50 top-0 inset-x-0 sm:fixed w-screen" />
                  <Header />
                  <Component {...pageProps} />
                </main>
                <Toaster
                  position="bottom-center"
                  toastOptions={{ duration: 1000 * 10 }}
                />
              </AssetsProvider>
            </SkipProvider>
          </WagmiConfig>
        </ChainProvider>
      </PersistQueryClientProvider>
    </>
  );
}
