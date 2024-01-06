import "@fontsource/jost/latin.css";
import "@/styles/globals.css";

import { ChainProvider } from "@cosmos-kit/react";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { ComponentProps } from "react";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { BuildInfo } from "@/components/BuildInfo";
import MainLayout from "@/components/MainLayout";
import { AssetsProvider } from "@/context/assets";
import { wallets } from "@/lib/cosmos-kit";
import { queryClient } from "@/lib/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { SkipProvider } from "@/solve";

const persister = createSyncStoragePersister({
  storage: typeof window !== "undefined" ? window.sessionStorage : undefined,
});

type ChainProviderProps = ComponentProps<typeof ChainProvider>;

const assets = getAssetLists() as ChainProviderProps["assetLists"];
const chains = getChains() as ChainProviderProps["chains"];

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>
          ibc.fun | Interchain transfers and swaps on any Cosmos chain
        </title>
        <meta
          name="description"
          content="Interchain transfers and swaps on any Cosmos chain"
        />
      </Head>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ChainProvider
          chains={chains}
          assetLists={assets}
          wallets={wallets}
          throwErrors={false}
        >
          <WagmiConfig config={wagmiConfig}>
            <SkipProvider>
              <AssetsProvider>
                <MainLayout>
                  <Component {...pageProps} />
                </MainLayout>
                <Toaster
                  position="bottom-center"
                  toastOptions={{ duration: 1000 * 10 }}
                />
              </AssetsProvider>
            </SkipProvider>
          </WagmiConfig>
        </ChainProvider>
      </PersistQueryClientProvider>
      <Analytics />
      <BuildInfo />
    </>
  );
}
