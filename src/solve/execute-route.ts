import {
  AxelarGMPRecoveryAPI,
  Environment,
} from "@axelar-network/axelarjs-sdk";
import { WalletClient } from "@cosmos-kit/core";
import { RouteResponse, SKIP_API_URL, SkipAPIClient } from "@skip-router/core";
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

  const firstMessage = messages[0];

  if ("evmTx" in firstMessage) {
    const tx = await walletClientEVM.sendTransaction({
      account: walletClientEVM.account as Account,
      to: firstMessage.evmTx.to as `0x${string}`,
      data: `0x${firstMessage.evmTx.data}`,
      chain: walletClientEVM.chain,
    });

    const axelarSDK = new AxelarGMPRecoveryAPI({
      environment: Environment.MAINNET,
    });

    while (true) {
      const status = await axelarSDK.queryTransactionStatus(tx);

      console.log(status);

      await wait(1000);
    }
  }

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
