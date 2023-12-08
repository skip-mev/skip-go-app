import "@/styles/globals.css";
import "@interchain-ui/react/styles";

import { ChainProvider } from "@cosmos-kit/react";
import * as RadixToast from "@radix-ui/react-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { AppProps } from "next/app";
import Head from "next/head";
import { ComponentProps } from "react";
import { WagmiConfig } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { BuildInfo } from "@/components/BuildInfo";
import MainLayout from "@/components/MainLayout";
import { AssetsProvider } from "@/context/assets";
import { ToastProvider } from "@/context/toast";
import { wallets } from "@/lib/cosmos-kit";
import { queryClient } from "@/lib/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { SkipProvider } from "@/solve";

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
      <main>
        <QueryClientProvider client={queryClient}>
          <ChainProvider
            chains={chains}
            assetLists={assets}
            wallets={wallets}
            wrappedWithChakra
            throwErrors={false}
          >
            <WagmiConfig config={wagmiConfig}>
              <SkipProvider>
                <AssetsProvider>
                  <RadixToast.ToastProvider>
                    <ToastProvider>
                      <MainLayout>
                        <Component {...pageProps} />
                      </MainLayout>
                    </ToastProvider>
                    <RadixToast.Viewport className="w-[390px] max-w-[100vw] flex flex-col gap-2 p-6 fixed bottom-0 right-0 z-[999999]" />
                  </RadixToast.ToastProvider>
                </AssetsProvider>
              </SkipProvider>
            </WagmiConfig>
          </ChainProvider>
        </QueryClientProvider>
      </main>
      <Analytics />
      <BuildInfo />
    </>
  );
}
