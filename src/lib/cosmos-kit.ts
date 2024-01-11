import { WalletClient } from "@cosmos-kit/core";
import { wallets as cosmostation } from "@cosmos-kit/cosmostation";
import { wallets as initia } from "@cosmos-kit/initia";
import { wallets as keplr } from "@cosmos-kit/keplr";
import { wallets as leap } from "@cosmos-kit/leap";
import { wallets as okxwallet } from "@cosmos-kit/okxwallet";
import { wallets as station } from "@cosmos-kit/station";
import { wallets as vectis } from "@cosmos-kit/vectis";
import { wallets as xdefi } from "@cosmos-kit/xdefi";

export const wallets = [
  ...keplr,
  ...cosmostation,
  ...initia,
  ...leap,
  ...okxwallet,
  ...station,
  ...vectis,
  ...xdefi,
];

export type MergedWalletClient =
  | import("@cosmos-kit/cosmostation-extension/cjs/extension/client").CosmostationClient
  | import("@cosmos-kit/cosmostation-mobile/cjs/wallet-connect/client").CosmostationClient
  | import("@cosmos-kit/initia-extension/cjs/extension/client").InitiaClient
  | import("@cosmos-kit/keplr-extension/cjs/extension/client").KeplrClient
  | import("@cosmos-kit/keplr-mobile/cjs/wallet-connect/client").KeplrClient
  | import("@cosmos-kit/leap-extension/cjs/extension/client").LeapClient
  | import("@cosmos-kit/leap-metamask-cosmos-snap/cjs/extension/client").CosmosSnapClient
  | import("@cosmos-kit/leap-mobile/cjs/wallet-connect/client").LeapClient
  | import("@cosmos-kit/okxwallet-extension/cjs/extension/client").OkxwalletClient
  | import("@cosmos-kit/station-extension/cjs/extension/client").StationClient
  | import("@cosmos-kit/vectis-extension/cjs/extension/client").VectisClient
  | import("@cosmos-kit/xdefi-extension/cjs/extension/client").XDEFIClient
  | WalletClient;
