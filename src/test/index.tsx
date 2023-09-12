import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { ChainProvider } from "@cosmos-kit/react-lite";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Queries,
  queries,
  render,
  RenderOptions,
} from "@testing-library/react";
import { assets,chains } from "chain-registry";
import React, { FC, Fragment, PropsWithChildren } from "react";

import { AssetsProvider } from "@/context/assets";
import { ChainsProvider } from "@/context/chains";
import { SkipProvider } from "@/solve";
import { queryClient } from "@/utils/query";

const AllTheProviders: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Fragment>
      <SkipProvider>
        <QueryClientProvider client={queryClient}>
          <ChainProvider
            chains={chains}
            assetLists={assets}
            wallets={[...keplrWallets]}
            throwErrors={false}
            logLevel="NONE"
            walletModal={() => <div></div>}
          >
            <ChainsProvider>
              <AssetsProvider>{children}</AssetsProvider>
            </ChainsProvider>
          </ChainProvider>
        </QueryClientProvider>
      </SkipProvider>
    </Fragment>
  );
};

function customRender<
  Q extends Queries = typeof queries,
  Container extends Element | DocumentFragment = HTMLElement,
  BaseElement extends Element | DocumentFragment = Container
>(
  ui: React.ReactElement,
  options: RenderOptions<Q, Container, BaseElement> = {}
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// re-export everything
export * from "@testing-library/react";

// override render method
export { customRender as render };
