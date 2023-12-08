import { configureChains, createConfig } from "wagmi";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

import { EVM_CHAINS } from "@/constants/constants";
import { OKXConnector } from "@/wallets/OKXConnector";

const { publicClient, chains } = configureChains(EVM_CHAINS, [
  publicProvider(),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({
      chains,
    }),
    OKXConnector,
  ],
  publicClient,
});
