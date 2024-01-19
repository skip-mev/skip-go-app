import { configureChains, createConfig } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

import { EVM_CHAINS } from "@/constants/wagmi";

const { publicClient, chains } = configureChains(EVM_CHAINS, [publicProvider()]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains }), new InjectedConnector({ chains })],
  publicClient,
});
