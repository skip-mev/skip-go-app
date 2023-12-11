import { configureChains, createConfig } from "wagmi";
import { LedgerConnector } from "wagmi/connectors/ledger";
import { MetaMaskConnector } from "wagmi/connectors/metaMask";
import { publicProvider } from "wagmi/providers/public";

import { EVM_CHAINS } from "@/constants/constants";

import { OkxWalletConnector } from "./wagmi/connectors";

const { publicClient, chains } = configureChains(EVM_CHAINS, [
  publicProvider(),
]);

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new OkxWalletConnector({ chains }),
    new LedgerConnector({
      chains,
      options: {
        //
      },
    }),
  ],
  publicClient,
});
