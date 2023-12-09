import { WalletClient } from "@cosmos-kit/core";
import { wallets as cosmostationWallets } from "@cosmos-kit/cosmostation";
import { wallets as keplrWallets } from "@cosmos-kit/keplr";
import { wallets as leapWallets } from "@cosmos-kit/leap";
import { wallets as okxWallets } from "@cosmos-kit/okxwallet";

export const wallets = [
  ...keplrWallets,
  ...leapWallets,
  ...cosmostationWallets,
  ...okxWallets,
];

export type MergedWalletClient =
  | WalletClient
  | import("@cosmos-kit/cosmostation-extension/cjs/extension/client").CosmostationClient
  | import("@cosmos-kit/keplr-extension/cjs/extension/client").KeplrClient
  | import("@cosmos-kit/leap-extension/cjs/extension/client").LeapClient
  | import("@cosmos-kit/okxwallet-extension/cjs/extension/client").OkxwalletClient;
