import { WalletClient } from "@cosmos-kit/core";
import { RouteResponse, SKIP_API_URL, SkipRouter } from "@skip-router/core";

import {
  enableChains,
  getAddressForChain,
  getExplorerLinkForTx,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  isLedger,
} from "@/utils/utils";

interface TxInfo {
  txHash: string | null;
  explorerLink: string | null;
}
export async function executeRoute(
  walletClient: WalletClient,
  route: RouteResponse,
  // eslint-disable-next-line no-unused-vars
  onTxSuccess: (info: TxInfo, index: number) => void,
) {
  await enableChains(walletClient, route.chainIDs);

  const userAddresses: Record<string, string> = {};
  const addressList = [];

  // get addresses
  for (const chainID of route.chainIDs) {
    const address = await getAddressForChain(walletClient, chainID);

    userAddresses[chainID] = address;
    addressList.push(address);
  }

  const skipClient = new SkipRouter({
    apiURL: SKIP_API_URL,
    getOfflineSigner: async (chainID) => {
      const signerIsLedger = await isLedger(walletClient, chainID);

      if (signerIsLedger) {
        return getOfflineSignerOnlyAmino(walletClient, chainID);
      }
      return getOfflineSigner(walletClient, chainID);
    },
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        return `https://ibc.fun/nodes/${chainID}`;
      },
      getRestEndpointForChain: async (chainID) => {
        if (chainID === "injective-1") {
          return "https://lcd.injective.network";
        }

        if (chainID === "evmos_9001-2") {
          return "https://rest.bd.evmos.org:1317";
        }

        return `https://ibc.fun/nodes/${chainID}`;
      },
    },
  });

  let i = 0;

  await skipClient.executeRoute({
    route,
    userAddresses,
    onTransactionSuccess: async (txHash, chainID) => {
      const explorerLink = getExplorerLinkForTx(chainID, txHash);

      onTxSuccess(
        {
          explorerLink,
          txHash,
        },
        i,
      );

      i++;
    },
  });
}
