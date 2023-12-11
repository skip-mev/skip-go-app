import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { ChainProvider } from "@cosmos-kit/react-lite";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Queries,
  queries,
  render,
  RenderOptions,
} from "@testing-library/react";
import React, { ComponentProps, FC, Fragment, PropsWithChildren } from "react";
import { WagmiConfig } from "wagmi";

import { getAssetLists, getChains } from "@/chains";
import { WalletModalProvider } from "@/components/WalletModal";
import { AssetsProvider } from "@/context/assets";
import { queryClient } from "@/lib/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { SkipProvider } from "@/solve";

type ChainProviderProps = ComponentProps<typeof ChainProvider>;

const assets = getAssetLists() as ChainProviderProps["assetLists"];
const chains = getChains() as ChainProviderProps["chains"];

export const AllTheProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Fragment>
      <QueryClientProvider client={queryClient}>
        <ChainProvider
          chains={chains}
          assetLists={assets}
          wallets={[...keplrWallets]}
          throwErrors={false}
          logLevel="NONE"
          walletModal={() => <div></div>}
        >
          <WagmiConfig config={wagmiConfig}>
            <SkipProvider>
              <WalletModalProvider>
                <AssetsProvider>{children}</AssetsProvider>
              </WalletModalProvider>
            </SkipProvider>
          </WagmiConfig>
        </ChainProvider>
      </QueryClientProvider>
    </Fragment>
  );
};

function customRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container,
>(
  ui: React.ReactElement,
  options: RenderOptions<Q, Container, BaseElement> = {},
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
