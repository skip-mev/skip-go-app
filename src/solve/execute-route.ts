import { RouteResponse, SkipRouter } from "@skip-router/core";

import { getExplorerLinkForTx } from "@/utils/utils";

interface TxInfo {
  txHash: string | null;
  explorerLink: string | null;
}
export async function executeRoute(
  skipRouter: SkipRouter,
  route: RouteResponse,
  userAddresses: Record<string, string>,
  addressList: string[],
  onTxSuccess: (info: TxInfo, index: number) => void,
  // walletClient: WalletClient,
) {
  let i = 0;

  await skipRouter.executeRoute({
    route,
    userAddresses,
    onTransactionSuccess: async (txStatus) => {
      // const { sendTx } = txStatus.transferSequence[0].packetTXs;
      // if (!sendTx) {
      //   return;
      // }

      const explorerLink = getExplorerLinkForTx(
        txStatus.chainID,
        txStatus.txHash,
      );

      onTxSuccess(
        {
          explorerLink,
          txHash: txStatus.txHash,
        },
        i,
      );

      i++;
    },
  });
}
