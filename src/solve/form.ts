import { useEffect, useMemo, useState } from "react";
import { Chain, useChains } from "@/context/chains";
import { Asset, useBalancesByChain } from "@/cosmos";
import { chains } from "chain-registry";
import { Operation, Swap, SwapOperation, isSwapOperation } from "./types";
import { useRoute } from "./queries";
import { ethers } from "ethers";
import { Route } from "@/components/TransactionDialog";
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
import { MsgsRequest, getMessages } from "./api";

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
        sourceChain: chains.find((chain) => chain.chain_id === chainID),
      }));
    }
  }, [chains, formValues.sourceChain]);

  useEffect(() => {
    if (formValues.sourceChain && !formValues.sourceAsset) {
      const feeAsset = getFeeDenom(formValues.sourceChain.chain_id);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          sourceAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.sourceChain.chain_id);
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
        (c) => c.chain_id === formValues.destinationAsset?.chainID
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
      const feeAsset = getFeeDenom(formValues.destinationChain.chain_id);

      if (feeAsset) {
        setFormValues((values) => ({
          ...values,
          destinationAsset: feeAsset,
        }));
      } else {
        const assets = assetsByChainID(formValues.destinationChain.chain_id);
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
        formValues.sourceChain.chain_id
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

  // const denomIn = useMemo(() => {
  //   if (!formValues.sourceAsset || !formValues.sourceChain) {
  //     return undefined;
  //   }

  //   return {
  //     denom: formValues.sourceAsset.denom,
  //     chainId: formValues.sourceChain.chain_id,
  //   } as IBCDenom;
  // }, [formValues.sourceAsset, formValues.sourceChain]);

  // const denomOut = useMemo(() => {
  //   if (!formValues.destinationAsset || !formValues.destinationChain) {
  //     return undefined;
  //   }

  //   return {
  //     denom: formValues.destinationAsset.denom,
  //     chainId: formValues.destinationChain.chain_id,
  //   } as IBCDenom;
  // }, [formValues.destinationAsset, formValues.destinationChain]);

  // Use compare denom response to determine whether we are performing a transfer or swap
  const actionType = "NONE";

  const {
    data: routeResponse,
    fetchStatus: routeFetchStatus,
    isError,
  } = useRoute(
    amountInWei,
    formValues.sourceAsset?.denom,
    formValues.sourceAsset?.chainID,
    formValues.destinationAsset?.denom,
    formValues.destinationAsset?.chainID,
    true
  );

  const routeLoading = useMemo(() => {
    return routeFetchStatus === "fetching";
  }, [routeFetchStatus]);

  const amountOut = useMemo(() => {
    if (!routeResponse) {
      return "0.0";
    }

    if (routeResponse.does_swap && routeResponse.estimated_amount_out) {
      return ethers.formatUnits(
        routeResponse.estimated_amount_out,
        formValues.destinationAsset?.decimals ?? 6
      );
    }

    return formValues.amountIn;
  }, [
    formValues.amountIn,
    formValues.destinationAsset?.decimals,
    routeResponse,
  ]);

  const numberOfTransactions = useMemo(() => {
    if (!routeResponse) {
      return 0;
    }

    if (routeResponse.does_swap) {
      return 1;
    }

    let n = 1;

    routeResponse.operations.forEach((hop, i) => {
      if (isSwapOperation(hop)) {
        return;
      }

      if (i !== 0 && !hop.transfer.pfm_enabled) {
        n += 1;
      }
    });

    return n;
  }, [routeResponse]);

  const route = useMemo(() => {
    if (
      !formValues.amountIn ||
      !formValues.sourceAsset ||
      !formValues.destinationAsset ||
      !formValues.sourceChain ||
      !formValues.destinationChain ||
      !routeResponse ||
      !amountOut
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
      operations: routeResponse?.operations ?? [],
      transactionCount: numberOfTransactions,
      actionType,
      rawRoute: routeResponse,
    };

    return _route;
  }, [
    amountOut,
    formValues.amountIn,
    formValues.destinationAsset,
    formValues.destinationChain,
    formValues.sourceAsset,
    formValues.sourceChain,
    numberOfTransactions,
    routeResponse,
  ]);

  const { address } = useChain(
    formValues.sourceChain?.chain_name ?? "cosmoshub"
  );

  const { data: balances } = useBalancesByChain(
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
  await enableChains(walletClient, route.rawRoute.chain_ids);

  const userAddresses: Record<string, string> = {};

  // get addresses
  for (const chainID of route.rawRoute.chain_ids) {
    const address = await getAddressForChain(walletClient, chainID);

    userAddresses[chainID] = address;
  }

  const msgRequest: MsgsRequest = {
    source_asset_denom: route.sourceAsset.denom,
    source_asset_chain_id: route.sourceChain.chain_id,
    dest_asset_denom: route.destinationAsset.denom,
    dest_asset_chain_id: route.destinationChain.chain_id,
    amount_in: ethers
      .parseUnits(route.amountIn, route.sourceAsset.decimals)
      .toString(),
    chain_ids_to_addresses: userAddresses,
    operations: route.operations,

    estimated_amount_out: ethers
      .parseUnits(route.amountOut, route.destinationAsset.decimals)
      .toString(),
    slippage_tolerance_percent: "5.0",
    affiliates: [],
  };

  const msgsResponse = await getMessages(msgRequest);

  // console.log(response);

  // check balances on chains where a tx is initiated
  for (let i = 0; i < msgsResponse.msgs.length; i++) {
    const multiHopMsg = msgsResponse.msgs[i];

    const chain = getChainByID(multiHopMsg.chain_id);

    const client = await getStargateClientForChainID(multiHopMsg.chain_id);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    let averageGasPrice = 0;
    if (feeInfo.average_gas_price) {
      averageGasPrice = feeInfo.average_gas_price;
    }

    const amountNeeded = averageGasPrice * 200000;

    const balance = await client.getBalance(
      userAddresses[multiHopMsg.chain_id],
      feeInfo.denom
    );

    if (parseInt(balance.amount) < amountNeeded) {
      throw new Error(
        `Insufficient fee token to initiate transfer on ${multiHopMsg.chain_id}. Need ${amountNeeded} ${feeInfo.denom}, but only have ${balance.amount} ${feeInfo.denom}.`
      );
    }
  }

  for (let i = 0; i < msgsResponse.msgs.length; i++) {
    const multiHopMsg = msgsResponse.msgs[i];

    const account = await getAccount(walletClient, multiHopMsg.chain_id);

    let signer: OfflineSigner;
    if (account.isNanoLedger) {
      signer = await getOfflineSignerOnlyAmino(
        walletClient,
        multiHopMsg.chain_id
      );
    } else {
      signer = await getOfflineSigner(walletClient, multiHopMsg.chain_id);
    }

    const chain = getChainByID(multiHopMsg.chain_id);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    const msgJSON = JSON.parse(multiHopMsg.msg);

    let msg: EncodeObject;
    const destinationChainID =
      i === msgsResponse.msgs.length - 1
        ? route.destinationChain.chain_id
        : msgsResponse.msgs[i + 1].chain_id;

    const destinationChainClient = await getStargateClientForChainID(
      destinationChainID
    );

    const destinationChainAddress = userAddresses[destinationChainID];

    const denomOut: string =
      i === msgsResponse.msgs.length - 1
        ? route.destinationAsset.denom
        : JSON.parse(msgsResponse.msgs[i + 1].msg).token.denom;

    const balanceBefore = await destinationChainClient.getBalance(
      destinationChainAddress,
      denomOut
    );
    if (
      multiHopMsg.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer"
    ) {
      const client = await getSigningStargateClientForChainID(
        multiHopMsg.chain_id,
        signer,
        {
          gasPrice: GasPrice.fromString(
            `${feeInfo.average_gas_price ?? 0}${feeInfo.denom}`
          ),
        }
      );

      msg = {
        typeUrl: multiHopMsg.msg_type_url,
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

      if (multiHopMsg.chain_id === "evmos_9001-2") {
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
      } else if (multiHopMsg.chain_id === "injective-1") {
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
        multiHopMsg.chain_id,
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
