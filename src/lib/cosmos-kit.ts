import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation-extension";
import { wallets as keplrWallets } from "@cosmos-kit/keplr-extension";
import { wallets as leapWallets } from "@cosmos-kit/leap-extension";
import { wallets as metamaskWallets } from "@cosmos-kit/leap-metamask-cosmos-snap";
import { wallets as okxWallets } from "@cosmos-kit/okxwallet";

export const wallets = [
  ...keplrWallets,
  ...leapWallets,
  ...cosmostationWallets,
  ...metamaskWallets,
  ...okxWallets,
];
