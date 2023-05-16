"use client";

import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import { ChainProvider, defaultTheme } from "@cosmos-kit/react";
import { chains, assets } from "chain-registry";
import { wallets } from "@cosmos-kit/keplr";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Chain } from "@/components/ChainSelect";
import { GasPrice } from "@cosmjs/stargate";

function Providers({ children }: React.PropsWithChildren) {
  const [client] = React.useState(
    new QueryClient({ defaultOptions: { queries: { staleTime: 5000 } } })
  );

  return (
    <QueryClientProvider client={client}>
      <ChakraProvider theme={defaultTheme}>
        <ChainProvider
          chains={chains}
          assetLists={assets}
          wallets={wallets}
          signerOptions={{
            signingStargate: (chain) => {
              chain.fees?.fee_tokens;
              return {
                gasPrice: GasPrice.fromString("0.025uosmo"),
              };
            },
          }}
          wrappedWithChakra
        >
          {children}
        </ChainProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default Providers;
