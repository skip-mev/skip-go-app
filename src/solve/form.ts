import { useEffect, useMemo, useState } from "react";
import { Chain, useChains } from "@/context/chains";
import { useBalancesByChain } from "@/cosmos";
import { AssetWithMetadata, isSwapOperation } from "./types";
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
  isLedger,
  signAmino,
  signAndBroadcastEvmos,
  signAndBroadcastInjective,
} from "@/utils/utils";
import {
  EncodeObject,
  OfflineSigner,
  TxBodyEncodeObject,
  coin,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignDoc,
} from "@cosmjs/proto-signing";
import {
  GasPrice,
  SignerData,
  StdFee,
  AminoTypes,
  createDefaultAminoConverters,
  SigningStargateClient,
  DeliverTxResponse,
} from "@cosmjs/stargate";
import { useAssets } from "@/context/assets";
import { useChain } from "@cosmos-kit/react";
import { MsgTransfer as MsgTransferInjective } from "@injectivelabs/sdk-ts";
import { WalletClient } from "@cosmos-kit/core";
import { useSkipClient } from "./hooks";
import { SkipClient, MsgsRequest } from "./client";
import { trackRoute } from "@/analytics";
import { KeplrClient, KeplrExtensionWallet } from "@cosmos-kit/keplr-extension";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import Long from "long";
import {
  makeSignDoc as makeSignDocAmino,
  encodeSecp256k1Pubkey,
} from "@cosmjs/amino";
import { OfflineAminoSigner } from "@keplr-wallet/types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { Int53 } from "@cosmjs/math";
import { fromBase64 } from "@cosmjs/encoding";
// import { LedgerSigner, LedgerConnector } from "@cosmjs/ledger-amino";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export type ActionType = "NONE" | "TRANSFER" | "SWAP";

export interface FormValues {
  amountIn: string;
  sourceChain?: Chain;
  sourceAsset?: AssetWithMetadata;
  destinationChain?: Chain;
  destinationAsset?: AssetWithMetadata;
}

export function useSolveForm() {
  const skipClient = useSkipClient();

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
        (c) => c.chain_id === formValues.destinationAsset?.chain_id
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
    skipClient,
    amountInWei,
    formValues.sourceAsset?.denom,
    formValues.sourceAsset?.chain_id,
    formValues.destinationAsset?.denom,
    formValues.destinationAsset?.chain_id,
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
  skipClient: SkipClient,
  walletClient: WalletClient,
  route: Route,
  onTxSuccess: (tx: any, index: number) => void,
  onError: (error: any) => void
) {
  trackRoute(route);

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

  const msgsResponse = await skipClient.fungible.getMessages(msgRequest);

  // check balances on chains where a tx is initiated
  for (let i = 0; i < msgsResponse.msgs.length; i++) {
    const multiHopMsg = msgsResponse.msgs[i];

    const chain = getChainByID(multiHopMsg.chain_id);

    const client = await getStargateClientForChainID(multiHopMsg.chain_id);

    const feeInfo = chain.fees?.fee_tokens[0];

    if (!feeInfo) {
      throw new Error("No fee info found");
    }

    // TODO(zrbecker): we should query wallet/node for correct gas amount as this varies
    // greatly between different chains, and can change depending on on-chain state.
    // This is just used to warn when user does not have the correct gas token, so should
    // be fine to leave it in the meantime.
    let gasNeeded = 200000;
    if (
      route.rawRoute.does_swap &&
      route.rawRoute.swap_venue?.chain_id === multiHopMsg.chain_id
    ) {
      gasNeeded = 1000000;
    }

    let averageGasPrice = 0;
    if (feeInfo.average_gas_price) {
      averageGasPrice = feeInfo.average_gas_price;
    }

    const amountNeeded = averageGasPrice * gasNeeded;

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

    const signerIsLedger = await isLedger(walletClient, multiHopMsg.chain_id);

    let signer: OfflineSigner;
    if (signerIsLedger) {
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

    let txHash = "";

    if (
      multiHopMsg.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer"
    ) {
      let gasPrice: GasPrice | undefined;
      try {
        gasPrice = GasPrice.fromString(
          `${feeInfo.average_gas_price ?? 0}${feeInfo.denom}`
        );
      } catch {
        // ignore error
      }

      const client = await getSigningStargateClientForChainID(
        multiHopMsg.chain_id,
        signer,
        {
          gasPrice,
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

      if (signerIsLedger) {
        const currentHeight = await client.getHeight();

        msg.value.timeoutHeight = {
          revisionHeight: Long.fromNumber(currentHeight).add(100),
          revisionNumber: Long.fromNumber(currentHeight).add(100),
        };

        msg.value.timeoutTimestamp = Long.fromNumber(0);
      }

      if (multiHopMsg.chain_id === "evmos_9001-2") {
        const tx = await signAndBroadcastEvmos(walletClient, msgJSON.sender, {
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

        txHash = tx.txhash;
      } else if (multiHopMsg.chain_id === "injective-1") {
        const tx = await signAndBroadcastInjective(
          walletClient,
          msgJSON.sender,
          MsgTransferInjective.fromJSON({
            amount: msgJSON.token,
            memo: msgJSON.memo,
            sender: msgJSON.sender,
            port: msgJSON.source_port,
            receiver: msgJSON.receiver,
            channelId: msgJSON.source_channel,
            timeout: msgJSON.timeout_timestamp,
          }),
          // TODO(zrbecker): This causes the behavior to default to "auto", this interface doesn't
          // seem to have a mechanism to set a multiple like 1.3.
          undefined
        );

        txHash = tx.txHash;
      } else {
        const acc = await client.getAccount(msgJSON.sender);

        let tx: DeliverTxResponse;

        const simulatedGas = await client.simulate(msgJSON.sender, [msg], "");

        if (signerIsLedger) {
          const txRaw = await signAmino(
            client,
            signer as OfflineAminoSigner,
            msgJSON.sender,
            [
              {
                typeUrl: multiHopMsg.msg_type_url,
                value: msg.value,
              },
            ],
            {
              amount: [coin(0, feeInfo.denom)],
              gas: `${simulatedGas * 1.2}`,
            },
            "",
            {
              accountNumber: acc?.accountNumber ?? 0,
              sequence: acc?.sequence ?? 0,
              chainId: multiHopMsg.chain_id,
            }
          );

          const txBytes = TxRaw.encode(txRaw).finish();

          tx = await client.broadcastTx(txBytes, undefined, undefined);
        } else {
          tx = await client.signAndBroadcast(msgJSON.sender, [msg], 1.3);
        }
        txHash = tx.transactionHash;
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

      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], 1.3);

      txHash = tx.transactionHash;
    }

    await skipClient.transaction.track(txHash, multiHopMsg.chain_id);

    while (true) {
      const statusResponse = await skipClient.transaction.status(
        txHash,
        multiHopMsg.chain_id
      );

      if (statusResponse.status === "STATE_COMPLETED") {
        if (statusResponse.error) {
          onError(statusResponse.error);
          return;
        }

        for (const packet of statusResponse.packets) {
          if (packet.error) {
            onError(packet.error);
            return;
          }
        }

        break;
      }

      await wait(1000);
    }

    onTxSuccess({}, i);
  }
}
