import https from "https";
import axios, { AxiosInstance } from "axios";
import {
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
  coin,
  encodePubkey,
  makeAuthInfoBytes,
  makeSignDoc,
} from "@cosmjs/proto-signing";

import { Chain, MultiChainMsg } from "../types";
import { FungibleService } from "./fungible";
import { TransactionService } from "./transaction";
import {
  getFee,
  getFeeDenom,
  getSigningStargateClientForChainID,
  getStargateClientForChainID,
} from "@/utils/utils";
import { encodeSecp256k1Pubkey } from "@cosmjs/amino";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import {
  SignerData,
  SigningStargateClient,
  StargateClient,
  StdFee,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { Int53 } from "@cosmjs/math";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64 } from "@cosmjs/encoding";
import { Sender, TxContext, createTxIBCMsgTransfer } from "@evmos/transactions";
import Long from "long";
import { createTxRaw } from "@evmos/proto";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.skip.money/v1";

interface GetChainsResponse {
  chains: Chain[];
}

type EndpointOptions = Record<
  string,
  {
    rpc?: string;
    rest?: string;
  }
>;

export interface SkipClientConfig {
  ignoreChains?: string[];
  endpointOptions?: EndpointOptions;
}

export class SkipClient {
  private httpClient: AxiosInstance;
  private ignoreChains: string[];

  private registry: Registry;
  private endpointOptions: EndpointOptions;

  public fungible: FungibleService;
  public transaction: TransactionService;

  constructor(
    config: SkipClientConfig = {
      ignoreChains: [],
    }
  ) {
    this.ignoreChains = config.ignoreChains ?? [];
    this.endpointOptions = config.endpointOptions ?? {};

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

  async executeMultiChainMessage(
    signerAddress: string,
    signer: OfflineDirectSigner,
    multiChainMessage: MultiChainMsg,
    feeDenom: string // TODO: get this from API
  ) {
    const accounts = await signer.getAccounts();
    const accountFromSigner = accounts.find(
      (account) => account.address === signerAddress
    );

    if (!accountFromSigner) {
      throw new Error("Failed to retrieve account from signer");
    }

    const { accountNumber, sequence } = await this.getAccountNumberAndSequence(
      signerAddress,
      multiChainMessage.chain_id
    );

    const rawTx = await this.signMultiChainMessageDirect(
      signerAddress,
      signer,
      multiChainMessage,
      {
        amount: [coin(0, feeDenom)],
        gas: "200000",
      },
      {
        accountNumber: accountNumber,
        sequence: sequence,
        chainId: multiChainMessage.chain_id,
      }
    );

    const txBytes = TxRaw.encode(rawTx).finish();

    const stargateClient = await this.getSigningStargateClient(
      multiChainMessage.chain_id,
      signer
    );

    return stargateClient.broadcastTx(txBytes);
  }

  async signMultiChainMessageDirect(
    signerAddress: string,
    signer: OfflineDirectSigner,
    multiChainMessage: MultiChainMsg,
    fee: StdFee,
    { accountNumber, sequence, chainId }: SignerData
  ) {
    if (multiChainMessage.chain_id.includes("evmos")) {
      return this.signMultiChainMessageDirectEvmos(
        signerAddress,
        signer,
        multiChainMessage,
        fee,
        { accountNumber, sequence, chainId }
      );
    }

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

  // TODO: This is previously existing code, just moved to a new function.
  // Using signMultiChainMessageDirect on evmos DOES currently fail.
  // I need to investigate what exactly is even different about this and hopefully remove it all together.
  async signMultiChainMessageDirectEvmos(
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

    const pk = Buffer.from(accountFromSigner.pubkey).toString("base64");

    const chain = {
      chainId: 9001,
      cosmosChainId: chainId,
    };

    const sender: Sender = {
      accountAddress: signerAddress,
      sequence: sequence,
      accountNumber: accountNumber,
      pubkey: pk,
    };

    const _fee = {
      amount: fee.amount[0].amount,
      denom: fee.amount[0].denom,
      gas: fee.gas,
    };

    const memo = "";

    const context: TxContext = {
      chain,
      sender,
      fee: _fee,
      memo,
    };

    const msg = message.value as MsgTransfer;

    const tx = createTxIBCMsgTransfer(context, {
      sourcePort: msg.sourcePort,
      sourceChannel: msg.sourceChannel,
      receiver: msg.receiver,
      timeoutTimestamp: msg.timeoutTimestamp?.toString() ?? "",
      memo: msg.memo,
      amount: msg.token?.amount ?? "0",
      denom: msg.token?.denom ?? "aevmos",
      revisionNumber: 0,
      revisionHeight: 0,
    });

    const { signDirect } = tx;

    const signResponse = await signer.signDirect(sender.accountAddress, {
      bodyBytes: signDirect.body.toBinary(),
      authInfoBytes: signDirect.authInfo.toBinary(),
      chainId: chain.cosmosChainId,
      accountNumber: new Long(sender.accountNumber),
    });

    if (!signResponse) {
      // Handle signature failure here.
      throw new Error("Signature failed");
    }

    const signatures = [
      new Uint8Array(Buffer.from(signResponse.signature.signature, "base64")),
    ];

    const { signed } = signResponse;

    const signedTx = createTxRaw(
      signed.bodyBytes,
      signed.authInfoBytes,
      signatures
    );

    return signedTx.message;
  }

  private getEncodeObjectFromMultiChainMessage(message: MultiChainMsg) {
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

  private async getSigningStargateClient(
    chainID: string,
    signer: OfflineSigner
  ) {
    const preferredRpcEndpoint = this.endpointOptions[chainID]?.rpc;
    if (preferredRpcEndpoint) {
      return SigningStargateClient.connectWithSigner(
        preferredRpcEndpoint,
        signer
      );
    }

    return getSigningStargateClientForChainID(chainID, signer);
  }

  private async getStargateClient(chainID: string) {
    const preferredRpcEndpoint = this.endpointOptions[chainID]?.rpc;
    if (preferredRpcEndpoint) {
      return StargateClient.connect(preferredRpcEndpoint);
    }

    return getStargateClientForChainID(chainID);
  }

  private async getAccountNumberAndSequence(
    address: string,
    chainID: string
  ): Promise<{
    accountNumber: number;
    sequence: number;
  }> {
    const client = await this.getStargateClient(chainID);

    const account = await client.getAccount(address);

    if (!account) {
      throw new Error("Failed to retrieve account");
    }

    return {
      accountNumber: account.accountNumber,
      sequence: account.sequence,
    };
  }

  private async getAccountNumberAndSequenceEvmos(address: string) {
    //
  }
}
