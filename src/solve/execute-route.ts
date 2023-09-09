import {
  enableChains,
  getAddressForChain,
  getChainByID,
  getExplorerLinkForTx,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  getStargateClientForChainID,
  isLedger,
} from "@/utils/utils";
import { OfflineSigner, coin } from "@cosmjs/proto-signing";
import { WalletClient } from "@cosmos-kit/core";
import { RouteResponse, SKIP_API_URL, SkipAPIClient } from "@skip-router/core";

interface TxInfo {
  txHash: string | null;
  explorerLink: string | null;
}
export async function executeRoute(
  walletClient: WalletClient,
  route: RouteResponse,
  onTxSuccess: (info: TxInfo, index: number) => void
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

  const skipClient = new SkipAPIClient(SKIP_API_URL, {
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        return `https://ibc.fun/nodes/${chainID}`;
      },
      getRestEndpointForChain: async (chainID) => {
        console.log(chainID);
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

  const messages = await skipClient.messages({
    sourceAssetDenom: route.sourceAssetDenom,
    sourceAssetChainID: route.sourceAssetChainID,
    destAssetDenom: route.destAssetDenom,
    destAssetChainID: route.destAssetChainID,
    amountIn: route.amountIn,
    amountOut: route.estimatedAmountOut ?? "0",
    addressList,
    operations: route.operations,
  });

  // check balances on chains where a tx is initiated
  for (let i = 0; i < messages.length; i++) {
    const multiHopMsg = messages[i];

    const chain = getChainByID(multiHopMsg.chainID);

    const client = await getStargateClientForChainID(multiHopMsg.chainID);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    let gasNeeded = 300000;
    if (route.doesSwap && route.swapVenue?.chainID === multiHopMsg.chainID) {
      gasNeeded = 1500000;
    }

    let averageGasPrice = 0;
    if (feeInfo.low_gas_price) {
      averageGasPrice = feeInfo.low_gas_price;
    } else if (feeInfo.average_gas_price) {
      averageGasPrice = feeInfo.average_gas_price;
    }

    const amountNeeded = averageGasPrice * gasNeeded;

    const balance = await client.getBalance(
      userAddresses[multiHopMsg.chainID],
      feeInfo.denom
    );

    if (parseInt(balance.amount) < amountNeeded) {
      throw new Error(
        `Insufficient fee token to initiate transfer on ${multiHopMsg.chainID}. Need ${amountNeeded} ${feeInfo.denom}, but only have ${balance.amount} ${feeInfo.denom}.`
      );
    }
  }

  for (let i = 0; i < messages.length; i++) {
    const multiHopMsg = messages[i];

    const chain = getChainByID(multiHopMsg.chainID);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    const signerIsLedger = await isLedger(walletClient, multiHopMsg.chainID);

    let signer: OfflineSigner;
    if (signerIsLedger) {
      signer = await getOfflineSignerOnlyAmino(
        walletClient,
        multiHopMsg.chainID
      );
    } else {
      signer = await getOfflineSigner(walletClient, multiHopMsg.chainID);
    }

    const tx = await skipClient.executeMultiChainMessage(
      userAddresses[multiHopMsg.chainID],
      signer,
      multiHopMsg,
      coin(0, feeInfo.denom)
    );

    await skipClient.waitForTransaction(
      multiHopMsg.chainID,
      tx.transactionHash
    );

    const explorerLink = getExplorerLinkForTx(
      multiHopMsg.chainID,
      tx.transactionHash
    );

    onTxSuccess(
      {
        explorerLink,
        txHash: tx.transactionHash,
      },
      i
    );
  }
}
