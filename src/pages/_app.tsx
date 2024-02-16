import "@fontsource/jost/latin.css";
import "@/styles/globals.css";
import "@interchain-ui/react/styles";

import { ChainProvider } from "@cosmos-kit/react";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import { ComponentProps } from "react";
import { WagmiConfig } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { DefaultSeo } from "@/components/DefaultSeo";
import { metadata } from "@/constants/seo";
import { DefaultLayout } from "@/layouts/default";
import { wallets } from "@/lib/cosmos-kit";
import { persister, queryClient } from "@/lib/react-query";
import { wagmiConfig } from "@/lib/wagmi";

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
          walletConnectOptions={
            process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
              ? {
                  signClient: {
                    name: metadata.name,
                    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
                  },
                }
              : undefined
          }
          wallets={wallets}
        >
          <WagmiConfig config={wagmiConfig}>
            <DefaultLayout>
              <Component {...pageProps} />
            </DefaultLayout>
          </WagmiConfig>
        </ChainProvider>
      </PersistQueryClientProvider>
    </>
  );
}
