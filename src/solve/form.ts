import { Chain, useChains } from "@/context/chains";
import { Asset, useBalancesByChain } from "@/cosmos";
import { use, useEffect, useMemo, useState } from "react";
import { IBCAddress, IBCDenom, IBCHop } from "./types";
import { useCompareDenoms, useSwapRoute, useTransferRoute } from "./queries";
import { ethers } from "ethers";
import { Route } from "@/components/TransactionDialog";
import {
  SwapMsgsRequest,
  SwapRouteResponse,
  getSwapMessages,
  getTransferMsgs,
} from "./api";
import {
  enableChains,
  getAccount,
  getAddressForChain,
  getChainByID,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  getSigningCosmWasmClientForChainID,
  getSigningStargateClientForChainID,
  getStargateClientForChainID,
  signAndBroadcastEvmos,
  signAndBroadcastInjective,
} from "@/utils/utils";
import { EncodeObject, OfflineSigner, coin } from "@cosmjs/proto-signing";
import { GasPrice } from "@cosmjs/stargate";
import { useAssets } from "@/context/assets";
import { useChain } from "@cosmos-kit/react";
import { MsgTransfer } from "@injectivelabs/sdk-ts";
import { useToast } from "@/context/toast";
import { WalletClient } from "@cosmos-kit/core";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ActionType = "NONE" | "TRANSFER" | "SWAP";

export interface FormValues {
  amountIn: string;
  sourceChain?: Chain;
  sourceAsset?: Asset;
  destinationChain?: Chain;
  destinationAsset?: Asset;
}

export function useSolveForm() {
  const { toast } = useToast();

  const { chains } = useChains();

  const { assetsByChainID, getFeeDenom } = useAssets();

  const [formValues, setFormValues] = useState<FormValues>({
    amountIn: "",
  });

  useEffect(() => {
    if (!formValues.sourceChain && chains.length > 0) {
      const chainID =
        localStorage.getItem("IBC_DOT_FUN__LAST_SOURCE_CHAIN") ?? "cosmoshub-4";
      setFormValues((values) => ({
        ...values,
        sourceChain: chains.find((chain) => chain.chainId === chainID),
      }));
    }
  }, [chains, formValues.sourceChain]);

  useEffect(() => {
    if (formValues.sourceChain && !formValues.sourceAsset) {
      const feeAsset = getFeeDenom(formValues.sourceChain.chainId);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          sourceAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.sourceChain.chainId);
        if (assets.length > 0) {
          setFormValues((values) => ({
            ...values,
            sourceAsset: assets[0],
          }));
        }
      }
    }
  }, [
    assetsByChainID,
    formValues.sourceAsset,
    formValues.sourceChain,
    getFeeDenom,
  ]);

  useEffect(() => {
    if (formValues.destinationAsset && !formValues.destinationChain) {
      const chain = chains.find(
        (c) => c.chainId === formValues.destinationAsset?.chainID
      );

      if (chain) {
        setFormValues((values) => ({
          ...values,
          destinationChain: chain,
        }));
      }
    }
  }, [chains, formValues.destinationAsset, formValues.destinationChain]);

  useEffect(() => {
    if (formValues.destinationChain && !formValues.destinationAsset) {
      const feeAsset = getFeeDenom(formValues.destinationChain.chainId);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          destinationAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.destinationChain.chainId);
        if (assets.length > 0) {
          setFormValues((values) => ({
            ...values,
            destinationAsset: assets[0],
          }));
        }
      }
    }
  }, [
    assetsByChainID,
    formValues.destinationAsset,
    formValues.destinationChain,
    getFeeDenom,
  ]);

  // store last selected source chain in local storage
  useEffect(() => {
    if (formValues.sourceChain) {
      localStorage.setItem(
        "IBC_DOT_FUN__LAST_SOURCE_CHAIN",
        formValues.sourceChain.chainId
      );
    }
  }, [formValues.sourceChain]);

  const amountInWei = useMemo(() => {
    if (!formValues.sourceAsset) {
      return "0";
    }

    try {
      return ethers
        .parseUnits(formValues.amountIn, formValues.sourceAsset.decimals)
        .toString();
    } catch (err) {
      return "0";
    }
  }, [formValues.amountIn, formValues.sourceAsset]);

  const denomIn = useMemo(() => {
    if (!formValues.sourceAsset || !formValues.sourceChain) {
      return undefined;
    }

    return {
      denom: formValues.sourceAsset.denom,
      chainId: formValues.sourceChain.chainId,
    } as IBCDenom;
  }, [formValues.sourceAsset, formValues.sourceChain]);

  const denomOut = useMemo(() => {
    if (!formValues.destinationAsset || !formValues.destinationChain) {
      return undefined;
    }

    return {
      denom: formValues.destinationAsset.denom,
      chainId: formValues.destinationChain.chainId,
    } as IBCDenom;
  }, [formValues.destinationAsset, formValues.destinationChain]);

  const { data: compareDenomsResponse } = useCompareDenoms(
    [denomIn, denomOut].filter(Boolean) as IBCDenom[],
    {
      onError: (err: any) => {
        toast("Error comparing assets", err.message);
      },
    }
  );

  // Use compare denom response to determine whether we are performing a transfer or swap
  const actionType: ActionType = useMemo(() => {
    if (!compareDenomsResponse) {
      return "NONE";
    }

    if (compareDenomsResponse.same) {
      return "TRANSFER";
    }

    return "SWAP";
  }, [compareDenomsResponse]);

  const {
    data: transferRouteResponse,
    fetchStatus: transferRouteFetchStatus,
    isError: transferRouteHasError,
  } = useTransferRoute(denomIn, denomOut, actionType === "TRANSFER");

  const {
    data: swapRouteResponse,
    fetchStatus: swapRouteFetchStatus,
    isError: swapRouteHasError,
  } = useSwapRoute(amountInWei, denomIn, denomOut, actionType === "SWAP");

  const routeLoading = useMemo(() => {
    if (actionType === "TRANSFER") {
      return transferRouteFetchStatus === "fetching";
    }

    if (actionType === "SWAP") {
      return swapRouteFetchStatus === "fetching";
    }

    return false;
  }, [actionType, swapRouteFetchStatus, transferRouteFetchStatus]);

  const isError = useMemo(() => {
    if (actionType === "TRANSFER") {
      return transferRouteHasError;
    }

    if (actionType === "SWAP") {
      return swapRouteHasError;
    }

    return false;
  }, [actionType, swapRouteHasError, transferRouteHasError]);

  const amountOut = useMemo(() => {
    if (transferRouteResponse) {
      return formValues.amountIn;
    }

    if (swapRouteResponse) {
      return ethers.formatUnits(
        swapRouteResponse.userSwapAmountOut,
        formValues.destinationAsset?.decimals ?? 6
      );
    }

    return "0.0";
  }, [
    formValues.amountIn,
    formValues.destinationAsset?.decimals,
    swapRouteResponse,
    transferRouteResponse,
  ]);

  const numberOfTransactions = useMemo(() => {
    if (swapRouteResponse) {
      return 1;
    }

    if (transferRouteResponse) {
      let n = 1;

      transferRouteResponse.forEach((hop, i) => {
        if (i !== 0 && !hop.pfmEnabled) {
          n += 1;
        }
      });

      return n;
    }

    return 0;
  }, [swapRouteResponse, transferRouteResponse]);

  const route = useMemo(() => {
    if (
      !formValues.amountIn ||
      !formValues.sourceAsset ||
      !formValues.destinationAsset ||
      !formValues.sourceChain ||
      !formValues.destinationChain ||
      !amountOut ||
      actionType === "NONE"
    ) {
      return;
    }

    const _route: Route = {
      amountIn: formValues.amountIn,
      amountOut: amountOut,
      sourceAsset: formValues.sourceAsset,
      sourceChain: formValues.sourceChain,
      destinationAsset: formValues.destinationAsset,
      destinationChain: formValues.destinationChain,
      data: swapRouteResponse ?? transferRouteResponse ?? [],
      transactionCount: numberOfTransactions,
      actionType,
    };

    return _route;
  }, [
    actionType,
    amountOut,
    formValues.amountIn,
    formValues.destinationAsset,
    formValues.destinationChain,
    formValues.sourceAsset,
    formValues.sourceChain,
    numberOfTransactions,
    swapRouteResponse,
    transferRouteResponse,
  ]);

  const { address } = useChain(
    formValues.sourceChain?.chainName ?? "cosmoshub"
  );

  const { data: balances, fetchStatus } = useBalancesByChain(
    address,
    formValues.sourceChain
  );

  const insufficientBalance = useMemo(() => {
    if (!formValues.sourceAsset || !balances) {
      return false;
    }

    const amountIn = parseFloat(formValues.amountIn);

    if (isNaN(amountIn)) {
      return false;
    }

    const balanceStr = balances[formValues.sourceAsset.denom] ?? "0";

    // const balance = parseFloat(balances[formValues.sourceAsset.denom] ?? "0");
    const balance = parseFloat(
      ethers.formatUnits(balanceStr, formValues.sourceAsset.decimals)
    );

    return amountIn > balance;
  }, [balances, formValues.amountIn, formValues.sourceAsset]);

  return {
    actionType,
    formValues,
    sourceChain: formValues.sourceChain,
    sourceAsset: formValues.sourceAsset,
    destinationChain: formValues.destinationChain,
    destinationAsset: formValues.destinationAsset,
    amountIn: formValues.amountIn,
    amountOut,
    setFormValues,
    routeLoading,
    isError,
    numberOfTransactions,
    route,
    insufficientBalance,
  };
}

export async function executeRoute(
  walletClient: WalletClient,
  route: Route,
  onTxSuccess: (tx: any, index: number) => void,
  onError: (error: any) => void
) {
  try {
    if (route.actionType === "SWAP") {
      await executeSwapRoute(
        walletClient,
        route.data as SwapRouteResponse,
        onTxSuccess
      );
    }

    if (route.actionType === "TRANSFER") {
      await executeTransferRoute(
        walletClient,
        ethers
          .parseUnits(route.amountIn, route.sourceAsset.decimals)
          .toString(),
        route.sourceAsset,
        route.sourceChain,
        route.destinationAsset,
        route.destinationChain,
        route.data as IBCHop[],
        onTxSuccess
      );
    }
  } catch (e) {
    onError(e);
  }
}

async function executeTransferRoute(
  walletClient: WalletClient,
  amount: string,
  sourceAsset: Asset,
  sourceChain: Chain,
  destinationAsset: Asset,
  destinationChain: Chain,
  hops: IBCHop[],
  onTxSuccess: (tx: any, index: number) => void
) {
  const chainIDs = [
    ...hops.map((hop) => hop.chainId),
    destinationChain.chainId,
  ];

  await enableChains(walletClient, chainIDs);

  const userAddresses: Record<string, IBCAddress> = {};

  // get addresses
  for (const chainID of chainIDs) {
    const address = await getAddressForChain(walletClient, chainID);

    userAddresses[chainID] = {
      address,
      chainId: chainID,
    };
  }

  const messages = await getTransferMsgs(
    amount,
    { denom: sourceAsset.denom, chainId: sourceChain.chainId },
    destinationChain.chainId,
    hops,
    Object.values(userAddresses)
  );

  // check balances on chains where a tx is initiated
  for (let i = 0; i < messages.length; i++) {
    const multiHopMsg = messages[i];

    const chain = getChainByID(multiHopMsg.chainId);

    const client = await getStargateClientForChainID(multiHopMsg.chainId);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    if (!feeInfo.average_gas_price) {
      throw new Error("no average gas price found");
    }

    const amountNeeded = feeInfo.average_gas_price * 200000;

    const balance = await client.getBalance(
      userAddresses[multiHopMsg.chainId].address,
      feeInfo.denom
    );

    if (parseInt(balance.amount) < amountNeeded) {
      throw new Error(
        `Insufficient fee token to initiate transfer on ${multiHopMsg.chainId}. Need ${amountNeeded} ${feeInfo.denom}, but only have ${balance.amount} ${feeInfo.denom}.`
      );
    }
  }

  for (let i = 0; i < messages.length; i++) {
    const multiHopMsg = messages[i];

    const account = await getAccount(walletClient, multiHopMsg.chainId);

    let signer: OfflineSigner;
    if (account.isNanoLedger) {
      signer = await getOfflineSignerOnlyAmino(
        walletClient,
        multiHopMsg.chainId
      );
    } else {
      signer = await getOfflineSigner(walletClient, multiHopMsg.chainId);
    }

    const chain = getChainByID(multiHopMsg.chainId);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    const msgJSON = JSON.parse(multiHopMsg.msg);

    const client = await getSigningStargateClientForChainID(
      multiHopMsg.chainId,
      signer,
      {
        gasPrice: GasPrice.fromString(
          `${feeInfo.average_gas_price}${feeInfo.denom}`
        ),
      }
    );

    const msg = {
      typeUrl: multiHopMsg.msgTypeUrl,
      value: {
        sourcePort: msgJSON.source_port,
        sourceChannel: msgJSON.source_channel,
        token: msgJSON.token,
        sender: msgJSON.sender,
        receiver: msgJSON.receiver,
        timeoutHeight: msgJSON.timeout_height,
        timeoutTimestamp: msgJSON.timeout_timestamp,
        memo: msgJSON.memo,
      },
    };

    if (multiHopMsg.chainId === "evmos_9001-2") {
      await signAndBroadcastEvmos(walletClient, msgJSON.sender, {
        sourcePort: msgJSON.source_port,
        sourceChannel: msgJSON.source_channel,
        receiver: msgJSON.receiver,
        timeoutTimestamp: msgJSON.timeout_timestamp,
        memo: msgJSON.memo,
        amount: msg.value.token.amount,
        denom: msg.value.token.denom,
        revisionNumber: 0,
        revisionHeight: 0,
      });
    } else if (multiHopMsg.chainId === "injective-1") {
      const tx = await signAndBroadcastInjective(
        walletClient,
        msgJSON.sender,
        MsgTransfer.fromJSON({
          amount: msgJSON.token,
          memo: msgJSON.memo,
          sender: msgJSON.sender,
          port: msgJSON.source_port,
          receiver: msgJSON.receiver,
          channelId: msgJSON.source_channel,
          timeout: msgJSON.timeout_timestamp,
        })
      );
    } else {
      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");
    }

    const destinationChainID = multiHopMsg.path[multiHopMsg.path.length - 1];

    const destinationChainClient = await getStargateClientForChainID(
      destinationChainID
    );

    const destinationChainAddress = userAddresses[destinationChainID].address;

    const denomOut: string =
      i === messages.length - 1
        ? destinationAsset.denom
        : JSON.parse(messages[i + 1].msg).token.denom;

    const balanceBefore = await destinationChainClient.getBalance(
      destinationChainAddress,
      denomOut
    );

    while (true) {
      console.log("polling...");

      const balance = await destinationChainClient.getBalance(
        destinationChainAddress,
        denomOut
      );

      if (parseInt(balance.amount) > parseInt(balanceBefore.amount)) {
        break;
      }

      await wait(1000);
    }

    onTxSuccess({}, i);
  }
}

async function executeSwapRoute(
  walletClient: WalletClient,
  route: SwapRouteResponse,
  onTxSuccess: (tx: any, index: number) => void
) {
  // get all chain IDs in path and connect in keplr
  const chainIDs = route.chainIds;

  await enableChains(walletClient, chainIDs);

  const userAddresses: Record<string, string> = {};

  // get addresses
  for (const chainID of chainIDs) {
    const address = await getAddressForChain(walletClient, chainID);
    userAddresses[chainID] = address;
  }

  const data: SwapMsgsRequest = {
    preSwapHops: route.preSwapHops,
    postSwapHops: route.postSwapHops,

    chainIdsToAddresses: userAddresses,

    sourceAsset: route.sourceAsset,
    destAsset: route.destAsset,
    amountIn: route.amountIn,

    userSwap: route.userSwap,
    userSwapAmountOut: route.userSwapAmountOut,
    userSwapSlippageTolerancePercent: "5.0",

    feeSwap: route.feeSwap,
    affiliates: [],
  };

  const msgsResponse = await getSwapMessages(data);

  // check balances on chains where a tx is initiated
  for (let i = 0; i < msgsResponse.requested.length; i++) {
    const multiHopMsg = msgsResponse.requested[i];

    const chain = getChainByID(multiHopMsg.chainId);

    const client = await getStargateClientForChainID(multiHopMsg.chainId);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    if (!feeInfo.average_gas_price) {
      throw new Error("no average gas price found");
    }

    const amountNeeded = feeInfo.average_gas_price * 200000;

    const balance = await client.getBalance(
      userAddresses[multiHopMsg.chainId],
      feeInfo.denom
    );

    if (parseInt(balance.amount) < amountNeeded) {
      throw new Error(
        `Insufficient fee token to initiate transfer on ${multiHopMsg.chainId}. Need ${amountNeeded} ${feeInfo.denom}, but only have ${balance.amount} ${feeInfo.denom}.`
      );
    }
  }

  const messages = msgsResponse.requested;

  for (let i = 0; i < msgsResponse.requested.length; i++) {
    const multiHopMsg = msgsResponse.requested[i];

    const account = await getAccount(walletClient, multiHopMsg.chainId);

    let signer: OfflineSigner;
    if (account.isNanoLedger) {
      signer = await getOfflineSignerOnlyAmino(
        walletClient,
        multiHopMsg.chainId
      );
    } else {
      signer = await getOfflineSigner(walletClient, multiHopMsg.chainId);
    }

    const chain = getChainByID(multiHopMsg.chainId);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    const msgJSON = JSON.parse(multiHopMsg.msg);

    let msg: EncodeObject;

    if (
      multiHopMsg.msgTypeUrl === "/ibc.applications.transfer.v1.MsgTransfer"
    ) {
      const client = await getSigningStargateClientForChainID(
        multiHopMsg.chainId,
        signer,
        {
          gasPrice: GasPrice.fromString(
            `${feeInfo.average_gas_price}${feeInfo.denom}`
          ),
        }
      );

      msg = {
        typeUrl: multiHopMsg.msgTypeUrl,
        value: {
          sourcePort: msgJSON.source_port,
          sourceChannel: msgJSON.source_channel,
          token: msgJSON.token,
          sender: msgJSON.sender,
          receiver: msgJSON.receiver,
          timeoutHeight: msgJSON.timeout_height,
          timeoutTimestamp: msgJSON.timeout_timestamp,
          memo: msgJSON.memo,
        },
      };

      if (multiHopMsg.chainId === "evmos_9001-2") {
        await signAndBroadcastEvmos(walletClient, msgJSON.sender, {
          sourcePort: msgJSON.source_port,
          sourceChannel: msgJSON.source_channel,
          receiver: msgJSON.receiver,
          timeoutTimestamp: msgJSON.timeout_timestamp,
          memo: msgJSON.memo,
          amount: msg.value.token.amount,
          denom: msg.value.token.denom,
          revisionNumber: 0,
          revisionHeight: 0,
        });
      } else if (multiHopMsg.chainId === "injective-1") {
        const tx = await signAndBroadcastInjective(
          walletClient,
          msgJSON.sender,
          MsgTransfer.fromJSON({
            amount: msgJSON.token,
            memo: msgJSON.memo,
            sender: msgJSON.sender,
            port: msgJSON.source_port,
            receiver: msgJSON.receiver,
            channelId: msgJSON.source_channel,
            timeout: msgJSON.timeout_timestamp,
          })
        );
      } else {
        const tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");
      }
    } else {
      msg = {
        typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
        value: {
          sender: msgJSON.sender,
          contract: msgJSON.contract,
          msg: Uint8Array.from(Buffer.from(JSON.stringify(msgJSON.msg))),
          funds: msgJSON.funds,
        },
      };

      const client = await getSigningCosmWasmClientForChainID(
        multiHopMsg.chainId,
        signer,
        {
          // @ts-ignore
          gasPrice: GasPrice.fromString(
            `${feeInfo.average_gas_price}${feeInfo.denom}`
          ),
        }
      );

      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");
    }

    const destinationChainID =
      i === msgsResponse.requested.length - 1
        ? route.destAsset.chainId
        : msgsResponse.requested[i + 1].chainId;

    const destinationChainClient = await getStargateClientForChainID(
      destinationChainID
    );

    const destinationChainAddress = userAddresses[destinationChainID];

    const denomOut: string =
      i === messages.length - 1
        ? route.destAsset.denom
        : JSON.parse(messages[i + 1].msg).token.denom;

    const balanceBefore = await destinationChainClient.getBalance(
      destinationChainAddress,
      denomOut
    );

    while (true) {
      console.log("polling...");

      const balance = await destinationChainClient.getBalance(
        destinationChainAddress,
        denomOut
      );

      if (parseInt(balance.amount) > parseInt(balanceBefore.amount)) {
        break;
      }

      await wait(1000);
    }

    onTxSuccess({}, i);
  }
}
