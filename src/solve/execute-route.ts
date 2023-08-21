import {
  enableChains,
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
import { EncodeObject, OfflineSigner, coin } from "@cosmjs/proto-signing";
import { GasPrice, DeliverTxResponse } from "@cosmjs/stargate";
import { MsgTransfer as MsgTransferInjective } from "@injectivelabs/sdk-ts";
import { WalletClient } from "@cosmos-kit/core";
import { SkipClient, MsgsRequest, RouteResponse } from "./client";
import Long from "long";
import { OfflineAminoSigner } from "@keplr-wallet/types";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function executeRoute(
  skipClient: SkipClient,
  walletClient: WalletClient,
  route: RouteResponse,
  onTxSuccess: (tx: any, index: number) => void,
  onError: (error: any) => void
) {
  await enableChains(walletClient, route.chain_ids);

  const userAddresses: Record<string, string> = {};

  // get addresses
  for (const chainID of route.chain_ids) {
    const address = await getAddressForChain(walletClient, chainID);

    userAddresses[chainID] = address;
  }

  const msgRequest: MsgsRequest = {
    source_asset_denom: route.source_asset_denom,
    source_asset_chain_id: route.source_asset_chain_id,
    dest_asset_denom: route.dest_asset_denom,
    dest_asset_chain_id: route.dest_asset_chain_id,
    amount_in: route.amount_in,
    chain_ids_to_addresses: userAddresses,
    operations: route.operations,

    estimated_amount_out: route.estimated_amount_out,
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

    let gasNeeded = 300000;
    if (
      route.does_swap &&
      route.swap_venue?.chain_id === multiHopMsg.chain_id
    ) {
      gasNeeded = 1500000;
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

    let gasNeeded = 300000;
    if (
      route.does_swap &&
      route.swap_venue?.chain_id === multiHopMsg.chain_id
    ) {
      gasNeeded = 1500000;
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

        // @ts-ignore
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
          {
            amount: [coin(0, feeInfo.denom)],
            gas: `${gasNeeded}`,
          }
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
          tx = await client.signAndBroadcast(msgJSON.sender, [msg], "auto");
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

      const tx = await client.signAndBroadcast(msgJSON.sender, [msg], {
        amount: [coin(0, feeInfo.denom)],
        gas: `${gasNeeded}`,
      });

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
