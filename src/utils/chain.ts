import { Chain, FeeAsset } from "@skip-router/core";

import { ChainId } from "@/chains/types";
import { CHAIN_NAME_TO_CHAINLIST_ID, CHAINLIST_LOGO_CHAIN_IDS } from "@/constants/chainlist";

export async function getChainFeeAssets(chainID: ChainId): Promise<FeeAsset[]> {
  const response = await fetch(`/api/gas/${chainID}`);
  if (!response.ok) return [];
  const feeAssets = await response.json();
  return feeAssets;
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
