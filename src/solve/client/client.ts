import https from "https";
import axios, { AxiosInstance } from "axios";
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignDoc,
} from "@cosmjs/proto-signing";

import { Chain, MultiChainMsg } from "../types";
import { FungibleService, MsgsRequest, RouteResponse } from "./fungible";
import { TransactionService } from "./transaction";
import { getStargateClientForChainID } from "@/utils/utils";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { SignerData, StdFee, defaultRegistryTypes } from "@cosmjs/stargate";
import { Int53 } from "@cosmjs/math";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64 } from "@cosmjs/encoding";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.skip.money/v1";

interface GetChainsResponse {
  chains: Chain[];
}

export class SkipClient {
  private httpClient: AxiosInstance;
  private ignoreChains: string[];

  private registry: Registry;

  public fungible: FungibleService;
  public transaction: TransactionService;

  constructor(ignoreChains: string[] = []) {
    this.ignoreChains = ignoreChains;

    const agent = new https.Agent({
      keepAlive: true,
    });

    this.httpClient = axios.create({
      baseURL: API_URL,
      httpsAgent: agent,
    });

    this.fungible = new FungibleService(this.httpClient);
    this.transaction = new TransactionService(this.httpClient);

    this.registry = new Registry(defaultRegistryTypes);
  }

  async chains(): Promise<Chain[]> {
    const response = await this.httpClient.get<GetChainsResponse>(
      "/info/chains"
    );

    const { chains } = response.data;

    return chains.filter(
      (chain) => !this.ignoreChains.includes(chain.chain_id)
    );
  }

  async signMultiChainMessageDirect(
    signerAddress: string,
    signer: OfflineDirectSigner,
    multiChainMessage: MultiChainMsg,
    fee: StdFee,
    { accountNumber, sequence, chainId }: SignerData
  ) {
    const accounts = await signer.getAccounts();
    const accountFromSigner = accounts.find(
      (account) => account.address === signerAddress
    );

    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const message =
      this.getEncodeObjectFromMultiChainMessage(multiChainMessage);

    const pubkey = encodePubkey(
      encodeSecp256k1Pubkey(accountFromSigner.pubkey)
    );

    const txBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: {
        messages: [message],
      },
    };

    const txBodyBytes = this.registry.encode(txBodyEncodeObject);

    const gasLimit = Int53.fromString(fee.gas).toNumber();

    const authInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence }],
      fee.amount,
      gasLimit,
      fee.granter,
      fee.payer
    );

    const signDoc = makeSignDoc(
      txBodyBytes,
      authInfoBytes,
      chainId,
      accountNumber
    );

    const { signature, signed } = await signer.signDirect(
      signerAddress,
      signDoc
    );

    return TxRaw.fromPartial({
      bodyBytes: signed.bodyBytes,
      authInfoBytes: signed.authInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  getEncodeObjectFromMultiChainMessage(message: MultiChainMsg) {
    const msgJson = JSON.parse(message.msg);

    if (message.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer") {
      return {
        typeUrl: "/ibc.applications.transfer.v1.MsgTransfer",
        value: MsgTransfer.fromJSON({
          sourcePort: msgJson.source_port,
          sourceChannel: msgJson.source_channel,
          token: msgJson.token,
          sender: msgJson.sender,
          receiver: msgJson.receiver,
          timeoutHeight: msgJson.timeout_height,
          timeoutTimestamp: msgJson.timeout_timestamp,
          memo: msgJson.memo,
        }),
      };
    }

    return {
      typeUrl: message.msg_type_url,
      value: msgJson,
    };
  }
}
