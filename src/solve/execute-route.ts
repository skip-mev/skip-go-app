import {
  AxelarAssetTransfer,
  AxelarGMPRecoveryAPI,
  Environment,
  QueryTransferStatus,
} from "@axelar-network/axelarjs-sdk";
import * as axelar from "@axelar-network/axelarjs-sdk";
import { coin, OfflineSigner } from "@cosmjs/proto-signing";
import { WalletClient } from "@cosmos-kit/core";
import {
  MultiChainMsg,
  RouteResponse,
  SKIP_API_URL,
  SkipAPIClient,
} from "@skip-router/core";
import {
  Account,
  getContract,
  maxUint256,
  PublicClient,
  WalletClient as ViemWalletClient,
  zeroAddress,
} from "viem";
import { erc20ABI } from "wagmi";

import { publicClient } from "@/pages/_app";
import {
  enableChains,
  getAddressForChain,
  getChainByID,
  getExplorerLinkForTx,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  isEVMChain,
  isLedger,
} from "@/utils/utils";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface TxInfo {
  txHash: string | null;
  explorerLink: string | null;
}
export async function executeRoute(
  walletClient: WalletClient,
  walletClientEVM: ViemWalletClient,
  route: RouteResponse,
  // eslint-disable-next-line no-unused-vars
  onTxSuccess: (info: TxInfo, index: number) => void,
) {
  // await enableChains(walletClient, route.chainIDs);

  const userAddresses: Record<string, string> = {};
  const addressList = [];

  // get addresses
  for (const chainID of route.chainIDs) {
    if (isEVMChain(chainID)) {
      if (walletClientEVM.account) {
        userAddresses[chainID] = walletClientEVM.account.address;
        addressList.push(walletClientEVM.account.address);
      }
      continue;
    }

    const address = await getAddressForChain(walletClient, chainID);

    userAddresses[chainID] = address;
    addressList.push(address);
  }

  const skipClient = new SkipAPIClient("https://solve-dev.skip.money", {
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
    addressList: route.chainIDs.map((chainID) => userAddresses[chainID]),
    operations: route.operations,
  });

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];

    if ("multiChainMsg" in message) {
      const tx = await executeCosmosMessage(
        userAddresses[message.multiChainMsg.chainID],
        skipClient,
        walletClient,
        message.multiChainMsg,
      );

      await skipClient.waitForTransaction(
        message.multiChainMsg.chainID,
        tx.transactionHash,
      );

      const nextMessage = i + 1 < messages.length ? messages[i + 1] : null;
      if (nextMessage && "evmTx" in nextMessage) {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const status = await getAxelarTransferStatus(tx.transactionHash);

          if (status === QueryTransferStatus.EXECUTED) {
            break;
          }

          await wait(1000);
        }
      }

      const explorerLink = getExplorerLinkForTx(
        message.multiChainMsg.chainID,
        tx.transactionHash,
      );

      onTxSuccess(
        {
          explorerLink,
          txHash: tx.transactionHash,
        },
        i,
      );
    } else {
      const tx = await walletClientEVM.sendTransaction({
        account: walletClientEVM.account as Account,
        to: message.evmTx.to as `0x${string}`,
        data: `0x${message.evmTx.data}`,
        chain: walletClientEVM.chain,
      });

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const status = await getAxelarTransferStatus(tx);

        if (status === QueryTransferStatus.EXECUTED) {
          break;
        }

        await wait(1000);
      }

      onTxSuccess(
        {
          txHash: null,
          explorerLink: null,
        },
        i,
      );
    }
  }

  // const firstMessage = messages[0];

  // if ("evmTx" in firstMessage) {
  // const tx = await walletClientEVM.sendTransaction({
  //   account: walletClientEVM.account as Account,
  //   to: firstMessage.evmTx.to as `0x${string}`,
  //   data: `0x${firstMessage.evmTx.data}`,
  //   chain: walletClientEVM.chain,
  // });

  //   const axelarSDK = new AxelarGMPRecoveryAPI({
  //     environment: Environment.MAINNET,
  //   });

  //   while (true) {
  //     const status = await axelarSDK.queryTransactionStatus(tx);

  //     console.log(status);

  //     await wait(1000);
  //   }
  // }

  // let i = 0;

  // await skipClient.executeRoute(route, userAddresses, {
  //   onTransactionSuccess: async (txStatus) => {
  //     const { sendTx } = txStatus.transferSequence[0].packetTXs;
  //     if (!sendTx) {
  //       return;
  //     }

  //     const explorerLink = getExplorerLinkForTx(sendTx.chainID, sendTx.txHash);

  //     onTxSuccess(
  //       {
  //         explorerLink,
  //         txHash: sendTx.txHash,
  //       },
  //       i
  //     );

  //     i++;
  //   },
  // });
}

async function executeCosmosMessage(
  signerAddress: string,
  skipClient: SkipAPIClient,
  walletClient: WalletClient,
  message: MultiChainMsg,
) {
  const signerIsLedger = await isLedger(walletClient, message.chainID);

  let signer: OfflineSigner;
  if (signerIsLedger) {
    signer = await getOfflineSignerOnlyAmino(walletClient, message.chainID);
  } else {
    signer = await getOfflineSigner(walletClient, message.chainID);
  }

  const chain = getChainByID(message.chainID);

  const feeInfo = chain.fees?.fee_tokens[0];

  if (!feeInfo) {
    throw new Error("No fee info found");
  }

  return skipClient.executeMultiChainMessage(
    signerAddress,
    signer,
    message,
    coin(0, feeInfo.denom),
  );
}

async function getAxelarTransferStatus(txHash: string) {
  const sdk = new axelar.AxelarTransferApi({
    environment: axelar.Environment.MAINNET,
  });

  const response = await sdk.axelarCrosschainApi
    .post("/transfers-status", {
      txHash,
    })
    .catch(() => undefined);

  if (!response) {
    throw new Error("Axelar Transfer API is not available");
  }

  if (response.length === 0) {
    throw new Error("No transfer found");
  }

  const transfer = response[0];
  if (transfer.status === undefined) {
    return QueryTransferStatus.ASSET_SENT;
  }

  return transfer.status as QueryTransferStatus;
}
