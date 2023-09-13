import "../styles/globals.css";
import "@interchain-ui/react/styles";

import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation-extension";
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { wallets as leapWallets } from "@cosmos-kit/leap-extension";
import { ChainProvider } from "@cosmos-kit/react";
import * as RadixToast from "@radix-ui/react-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { assets, chains } from "chain-registry";
import { AppProps } from "next/app";
import Head from "next/head";

import MainLayout from "@/components/MainLayout";
import { AssetsProvider } from "@/context/assets";
import { ChainsProvider } from "@/context/chains";
import { ToastProvider } from "@/context/toast";
import { SkipProvider } from "@/solve";
import { queryClient } from "@/utils/query";

export default function App({ Component, pageProps }: AppProps) {
  chains.push({
    $schema: "../chain.schema.json",
    chain_name: "neutron",
    status: "live",
    network_type: "mainnet",
    pretty_name: "Neutron",
    chain_id: "neutron-1",
    bech32_prefix: "neutron",
    daemon_name: "neutrond",
    node_home: "$HOME/.neutrond",
    key_algos: ["secp256k1"],
    slip44: 118,
    fees: {
      fee_tokens: [
        {
          denom: "untrn",
          low_gas_price: 0.01,
          average_gas_price: 0.025,
          high_gas_price: 0.05,
        },
      ],
    },
    codebase: {
      git_repo: "https://github.com/neutron-org/neutron",
      recommended_version: "v1.0.1",
      compatible_versions: [],
      cosmos_sdk_version: "0.45",
      consensus: {
        type: "tendermint",
        version: "0.34",
      },
      cosmwasm_version: "0.31",
      cosmwasm_enabled: true,
      ibc_go_version: "4.3.0",
      genesis: {
        genesis_url:
          "https://raw.githubusercontent.com/neutron-org/mainnet-assets/main/neutron-1-genesis.json",
      },
      versions: [
        {
          name: "v1.0.1",
          recommended_version: "v1.0.1",
          compatible_versions: [],
          cosmos_sdk_version: "0.45",
          consensus: {
            type: "tendermint",
            version: "0.34",
          },
          cosmwasm_version: "0.31",
          cosmwasm_enabled: true,
          ibc_go_version: "4.3.0",
        },
      ],
    },
    logo_URIs: {
      png: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/neutron-black-logo.png",
      svg: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/neutron-black-logo.svg",
    },
    peers: {
      seeds: [
        {
          id: "24f609fb5946ca3a979f40b7f54132c00104433e",
          address: "p2p-erheim.neutron-1.neutron.org:26656",
          provider: "Neutron",
        },
        {
          id: "b1c6fa570a184c56d0d736d260b8065d887e717c",
          address: "p2p-kralum.neutron-1.neutron.org:26656",
          provider: "Neutron",
        },
        {
          id: "20e1000e88125698264454a884812746c2eb4807",
          address: "seeds.lavenderfive.com:19156",
          provider: "Lavender.Five Nodes 🐝",
        },
      ],
      persistent_peers: [
        {
          id: "e5d2743d9a3de514e4f7b9461bf3f0c1500c58d9",
          address: "neutron.peer.stakewith.us:39956",
          provider: "StakeWithUs",
        },
      ],
    },
    apis: {
      rpc: [
        {
          address: "https://rpc-kralum.neutron-1.neutron.org",
          provider: "Neutron",
        },
        {
          address: "https://rpc.novel.remedy.tm.p2p.org",
          provider: "P2P",
        },
        {
          address: "https://neutron-rpc.lavenderfive.com",
          provider: "Lavender.Five Nodes 🐝",
        },
      ],
      rest: [
        {
          address: "https://rest-kralum.neutron-1.neutron.org",
          provider: "Neutron",
        },
        {
          address: "https://api.novel.remedy.tm.p2p.org",
          provider: "P2P",
        },
        {
          address: "https://neutron-api.lavenderfive.com",
          provider: "Lavender.Five Nodes 🐝",
        },
      ],
      grpc: [
        {
          address: "grpc-kralum.neutron-1.neutron.org:80",
          provider: "Neutron",
        },
        {
          address: "https://grpc.novel.remedy.tm.p2p.org",
          provider: "P2P",
        },
        {
          address: "https://grpc-web.novel.remedy.tm.p2p.org",
          provider: "P2P",
        },
        {
          address: "neutron-grpc.lavenderfive.com:443",
          provider: "Lavender.Five Nodes 🐝",
        },
      ],
    },
    explorers: [
      {
        kind: "Mintscan",
        url: "https://www.mintscan.io/neutron",
        tx_page: "https://www.mintscan.io/neutron/txs/${txHash}",
        account_page:
          "https://www.mintscan.io/neutron/account/${accountAddress}",
      },
    ],
  });

  const wallets = [...keplrWallets, ...cosmostationWallets, ...leapWallets];

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
            <SkipProvider>
              <ChainsProvider>
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
              </ChainsProvider>
            </SkipProvider>
          </ChainProvider>
        </QueryClientProvider>
      </main>
      <Analytics />
    </>
  );
}
