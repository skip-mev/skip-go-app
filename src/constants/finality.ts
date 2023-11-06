import {
  arbitrum,
  avalanche,
  base,
  celo,
  fantom,
  filecoin,
  linea,
  mainnet as ethereum,
  moonbeam,
  opBNB,
  optimism,
  polygon,
} from "wagmi/chains";

import { kava } from "./constants";

/** @see https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions */
const finalityTimeMap: Record<string, string> = {
  [`${ethereum.id}`]: "16 minutes",
  [`${avalanche.id}`]: "3 seconds",
  [`${polygon.id}`]: "4:42 minutes",
  [`${opBNB.id}`]: "46 seconds",
  [`${fantom.id}`]: "3 seconds",
  [`${kava.id}`]: "45 seconds",
  [`${optimism.id}`]: "30 minutes",
  [`${linea.id}`]: "81 minutes",
  [`${filecoin.id}`]: "52 minutes",
  [`${moonbeam.id}`]: "25 seconds",
  [`${celo.id}`]: "12 seconds",
  [`${arbitrum.id}`]: "19:06 minutes",
  [`${base.id}`]: "24 minutes",
};

/** @see https://docs.axelar.dev/learn/txduration#common-finality-time-for-interchain-transactions */
export const getFinalityTime = (id: string | number) => {
  return finalityTimeMap[`${id}`] || "~30 minutes";
};
