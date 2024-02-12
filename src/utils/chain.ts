import { GasPrice } from "@cosmjs/stargate";
import { Chain, FeeAsset } from "@skip-router/core";

import { CUSTOM_GAS_PRICE_CHAIN_IDS } from "@/config/gas";
import { CHAIN_NAME_TO_CHAINLIST_ID, CHAINLIST_LOGO_CHAIN_IDS } from "@/constants/chainlist";

export async function getChainFeeAssets(chainID: string): Promise<FeeAsset[]> {
  const response = await fetch(`/api/fee-assets/${chainID}`);
  if (!response.ok) return [];
  const feeAssets = await response.json();
  return feeAssets;
}

export async function getChainGasPrice(chainID: string): Promise<GasPrice | undefined> {
  const customGasPrice = CUSTOM_GAS_PRICE_CHAIN_IDS[chainID];
  if (customGasPrice) return customGasPrice;
  const response = await fetch(`/api/gas/${chainID}`);
  if (!response.ok) return;
  return GasPrice.fromString(await response.text());
}

export function getChainLogo(chain: Chain) {
  if (chain.logoURI && chain.logoURI.match("-light")) {
    return chain.logoURI.replace("-light", "-dark");
  }

  if (CHAINLIST_LOGO_CHAIN_IDS.includes(chain.chainID)) {
    return getChainlistProxyURI(chain.chainName);
  }

  return chain.logoURI || getChainlistProxyURI(chain.chainName);
}

export function getChainlistURI(chainName: string) {
  const name = CHAIN_NAME_TO_CHAINLIST_ID[chainName] || chainName;
  return `https://raw.githubusercontent.com/cosmostation/chainlist/main/chain/${name}/chainImg/_chainImg.svg`;
}

export function getChainlistProxyURI(chainName: string) {
  return `/api/chainlist/${chainName}`;
}

/**
 * - deprio denoms start with 'ibc/' and 'factory/'
 * - prio denoms start with 'u' or 'uu'
 */
export function sortFeeAssets(a: FeeAsset, b: FeeAsset) {
  const aIsDeprio = a.denom.startsWith("ibc/") || a.denom.startsWith("factory/");
  const bIsDeprio = b.denom.startsWith("ibc/") || b.denom.startsWith("factory/");
  const aIsPrio = a.denom.startsWith("u") || a.denom.startsWith("uu");
  const bIsPrio = b.denom.startsWith("u") || b.denom.startsWith("uu");

  if (aIsDeprio && !bIsDeprio) return 1;
  if (!aIsDeprio && bIsDeprio) return -1;
  if (aIsPrio && !bIsPrio) return -1;
  if (!aIsPrio && bIsPrio) return 1;

  return 0;
}
