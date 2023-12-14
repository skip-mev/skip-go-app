/* eslint-disable @typescript-eslint/no-explicit-any */

import { Cosmos } from "@cosmos-kit/cosmostation-extension/cjs/extension/types";
import { Window as KeplrWindow } from "@keplr-wallet/types";
import { WindowProvider } from "wagmi/window";

declare global {
  interface Window extends KeplrWindow {
    cosmostation?: CosmostationWindow;
    leap?: KeplrWindow["keplr"];

    ethereum?: WindowProvider;
    okexchain?: {
      ethereum?: WindowProvider;
    };
  }
}

interface CosmostationWindow {
  cosmos: Cosmos;
  providers: {
    keplr: KeplrWindow["keplr"];
  };
}
