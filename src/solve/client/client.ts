import https from "https";
import axios, { AxiosInstance } from "axios";
import {
  Coin,
  EncodeObject,
  OfflineDirectSigner,
  OfflineSigner,
  Registry,
  TxBodyEncodeObject,
  coin,
  encodePubkey,
  isOfflineDirectSigner,
  makeAuthInfoBytes,
  makeSignDoc,
} from "@cosmjs/proto-signing";
import { Chain, MultiChainMsg } from "../types";
import { FungibleService, RouteResponse } from "./fungible";
import { TransactionService } from "./transaction";
import {
  enableChains,
  getAddressForChain,
  getChainByID,
  getOfflineSigner,
  getOfflineSignerOnlyAmino,
  getSigningStargateClientForChainID,
  getStargateClientForChainID,
  isLedger,
  wait,
} from "@/utils/utils";
import {
  OfflineAminoSigner,
  encodeSecp256k1Pubkey,
  makeSignDoc as makeSignDocAmino,
} from "@cosmjs/amino";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { MsgExecuteContract } from "cosmjs-types/cosmwasm/wasm/v1/tx";
import {
  AminoTypes,
  DeliverTxResponse,
  SignerData,
  SigningStargateClient,
  StargateClient,
  StdFee,
  createDefaultAminoConverters,
  defaultRegistryTypes,
} from "@cosmjs/stargate";
import { Int53 } from "@cosmjs/math";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { fromBase64, toUtf8 } from "@cosmjs/encoding";
import { Sender, TxContext, createTxIBCMsgTransfer } from "@evmos/transactions";
import Long from "long";
import { createTxRaw } from "@evmos/proto";
import {
  ChainRestAuthApi,
  createTransaction,
  getTxRawFromTxRawOrDirectSignResponse,
  MsgExecuteContract as MsgExecuteContractInjective,
  MsgTransfer as MsgTransferInjective,
  Msgs,
  ChainRestTendermintApi,
  TxRestClient,
} from "@injectivelabs/sdk-ts";
import {
  BigNumberInBase,
  DEFAULT_BLOCK_TIMEOUT_HEIGHT,
} from "@injectivelabs/utils";
import { WalletClient } from "@cosmos-kit/core";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";

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

  async executeRoute(
    walletClient: WalletClient,
    route: RouteResponse,
    onTxSuccess: (txHash: string, index: number) => void
  ) {
    await enableChains(walletClient, route.chain_ids);

    const userAddresses: Record<string, string> = {};

    // get addresses
    for (const chainID of route.chain_ids) {
      const address = await getAddressForChain(walletClient, chainID);

      userAddresses[chainID] = address;
    }

    const { msgs } = await this.fungible.getMessages({
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
    });

    await this.verifyGasTokenBalances(msgs, userAddresses);

    for (let i = 0; i < msgs.length; i++) {
      const message = msgs[i];

      const chain = getChainByID(message.chain_id);

      const feeInfo = chain.fees?.fee_tokens[0];

      if (!feeInfo) {
        throw new Error("No fee info found");
      }

      let signer: OfflineSigner;

      const signerIsLedger = await isLedger(walletClient, message.chain_id);
      if (signerIsLedger) {
        signer = await getOfflineSignerOnlyAmino(
          walletClient,
          message.chain_id
        );
      } else {
        signer = await getOfflineSigner(walletClient, message.chain_id);
      }

      const signerAddress = userAddresses[message.chain_id];

      const tx = await this.executeMultiChainMessage(
        signerAddress,
        signer,
        message,
        coin(0, feeInfo.denom)
      );

      await this.waitForTransaction(tx.transactionHash, message.chain_id);

      onTxSuccess(tx.transactionHash, i);
    }
  }

  private async waitForTransaction(txHash: string, chainID: string) {
    await this.transaction.track(txHash, chainID);

    while (true) {
      const statusResponse = await this.transaction.status(txHash, chainID);

      if (statusResponse.status === "STATE_COMPLETED") {
        if (statusResponse.error) {
          throw new Error(statusResponse.error.message);
        }

        for (const packet of statusResponse.packets) {
          if (packet.error) {
            throw new Error(packet.error.message);
          }
        }

        break;
      }

      await wait(1000);
    }
  }

  private async verifyGasTokenBalances(
    messages: MultiChainMsg[],
    userAddresses: Record<string, string>
  ) {
    for (const message of messages) {
      const chain = getChainByID(message.chain_id);

      const feeInfo = chain.fees?.fee_tokens[0];

      if (!feeInfo) {
        throw new Error("No fee info found");
      }

      const client = await this.getStargateClient(message.chain_id);

      const gasNeeded = this.getGasAmountForMessage(message);

      let averageGasPrice = 0;
      if (feeInfo.average_gas_price) {
        averageGasPrice = feeInfo.average_gas_price;
      }

      const amountNeeded = averageGasPrice * parseInt(gasNeeded);

      const balance = await client.getBalance(
        userAddresses[message.chain_id],
        feeInfo.denom
      );

      if (parseInt(balance.amount) < amountNeeded) {
        throw new Error(
          `Insufficient fee token to initiate transfer on ${message.chain_id}. Need ${amountNeeded} ${feeInfo.denom}, but only have ${balance.amount} ${feeInfo.denom}.`
        );
      }
    }
  }

  async executeMultiChainMessage(
    signerAddress: string,
    signer: OfflineSigner,
    multiChainMessage: MultiChainMsg,
    feeAmount: Coin
  ): Promise<DeliverTxResponse> {
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

    const gas = this.getGasAmountForMessage(multiChainMessage);

    let rawTx: TxRaw;
    if (isOfflineDirectSigner(signer)) {
      rawTx = await this.signMultiChainMessageDirect(
        signerAddress,
        signer,
        multiChainMessage,
        {
          amount: [feeAmount],
          gas,
        },
        {
          accountNumber: accountNumber,
          sequence: sequence,
          chainId: multiChainMessage.chain_id,
        }
      );
    } else {
      rawTx = await this.signMultiChainMessageAmino(
        signerAddress,
        signer,
        multiChainMessage,
        {
          amount: [feeAmount],
          gas,
        },
        {
          accountNumber: accountNumber,
          sequence: sequence,
          chainId: multiChainMessage.chain_id,
        }
      );
    }

    if (multiChainMessage.chain_id.includes("injective")) {
      const preferredRestEndpoint =
        this.endpointOptions[multiChainMessage.chain_id]?.rest ??
        "https://lcd.injective.network";

      const txRestClient = new TxRestClient(preferredRestEndpoint);

      const tx = await txRestClient.broadcast(rawTx, {
        // @ts-ignore
        mode: "sync",
      });

      return {
        height: tx.height,
        txIndex: 0,
        code: tx.code,
        transactionHash: tx.txHash,
        events: [],
        rawLog: tx.rawLog,
        gasUsed: tx.gasUsed,
        gasWanted: tx.gasWanted,
      };
    }

    const txBytes = TxRaw.encode(rawTx).finish();

    const stargateClient = await this.getSigningStargateClient(
      multiChainMessage.chain_id,
      signer
    );

    const tx = await stargateClient.broadcastTx(txBytes);

    return tx;
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

    if (multiChainMessage.chain_id.includes("injective")) {
      return this.signMultiChainMessageDirectInjective(
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

    this.registry.register(
      "/cosmwasm.wasm.v1.MsgExecuteContract",
      MsgExecuteContract
    );

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

  // TODO: This is previously existing code, just moved to a new function.
  // Using signMultiChainMessageDirect on injective DOES currently fail.
  // I need to investigate what exactly is even different about this and hopefully remove it all together.
  async signMultiChainMessageDirectInjective(
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

    /** Block Details */
    const preferredRestEndpoint =
      this.endpointOptions[multiChainMessage.chain_id]?.rest ??
      "https://lcd.injective.network";

    const chainRestTendermintApi = new ChainRestTendermintApi(
      preferredRestEndpoint
    );
    const latestBlock = await chainRestTendermintApi.fetchLatestBlock();
    const latestHeight = latestBlock.header.height;
    const timeoutHeight = new BigNumberInBase(latestHeight).plus(
      DEFAULT_BLOCK_TIMEOUT_HEIGHT
    );

    const pk = Buffer.from(accountFromSigner.pubkey).toString("base64");

    const message =
      this.getEncodeObjectFromMultiChainMessageInjective(multiChainMessage);

    const { signDoc } = createTransaction({
      pubKey: pk,
      chainId: chainId,
      message: [message],
      sequence,
      accountNumber,
      timeoutHeight: timeoutHeight.toNumber(),
      fee,
    });

    const directSignResponse = await signer.signDirect(
      signerAddress,
      // @ts-ignore
      signDoc
    );

    return getTxRawFromTxRawOrDirectSignResponse(directSignResponse);
  }

  async signMultiChainMessageAmino(
    signerAddress: string,
    signer: OfflineAminoSigner,
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

    const signMode = SignMode.SIGN_MODE_LEGACY_AMINO_JSON;

    const aminoTypes = new AminoTypes(createDefaultAminoConverters());

    const msgs = [aminoTypes.toAmino(message)];

    msgs[0].value.memo = message.value.memo;

    const signDoc = makeSignDocAmino(
      msgs,
      fee,
      chainId,
      "",
      accountNumber,
      sequence
    );

    const { signature, signed } = await signer.signAmino(
      signerAddress,
      signDoc
    );

    const signedTxBody = {
      messages: signed.msgs.map((msg) => aminoTypes.fromAmino(msg)),
      memo: signed.memo,
    };

    signedTxBody.messages[0].value.memo = message.value.memo;

    const signedTxBodyEncodeObject: TxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };

    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);

    const signedGasLimit = Int53.fromString(signed.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signed.sequence).toNumber();

    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey, sequence: signedSequence }],
      signed.fee.amount,
      signedGasLimit,
      signed.fee.granter,
      signed.fee.payer,
      signMode
    );

    return TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
  }

  private getEncodeObjectFromMultiChainMessage(
    message: MultiChainMsg
  ): EncodeObject {
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

    if (message.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
      return {
        typeUrl: message.msg_type_url,
        value: MsgExecuteContract.fromPartial({
          sender: msgJson.sender,
          contract: msgJson.contract,
          msg: toUtf8(JSON.stringify(msgJson.msg)),
          funds: msgJson.funds,
        }),
      };
    }

    return {
      typeUrl: message.msg_type_url,
      value: msgJson,
    };
  }

  private getEncodeObjectFromMultiChainMessageInjective(
    message: MultiChainMsg
  ): Msgs {
    const msgJson = JSON.parse(message.msg);

    if (message.msg_type_url === "/ibc.applications.transfer.v1.MsgTransfer") {
      return MsgTransferInjective.fromJSON({
        port: msgJson.source_port,
        channelId: msgJson.source_channel,
        amount: msgJson.token,
        sender: msgJson.sender,
        receiver: msgJson.receiver,
        // height: msgJson.timeout_height,
        timeout: msgJson.timeout_timestamp,
        memo: msgJson.memo,
      });
    }

    if (message.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
      return MsgExecuteContractInjective.fromJSON({
        sender: msgJson.sender,
        contractAddress: msgJson.contract,
        msg: toUtf8(JSON.stringify(msgJson.msg)),
        funds: msgJson.funds,
      });
    }

    throw new Error("Unsupported message type");
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
    if (chainID.includes("evmos")) {
      return this.getAccountNumberAndSequenceEvmos(address, chainID);
    }

    if (chainID.includes("injective")) {
      return this.getAccountNumberAndSequenceInjective(address, chainID);
    }

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

  private async getAccountNumberAndSequenceInjective(
    address: string,
    chainID: string
  ) {
    const preferredRestEndpoint =
      this.endpointOptions[chainID]?.rest ?? "https://lcd.injective.network";

    const chainRestAuthApi = new ChainRestAuthApi(preferredRestEndpoint);

    const accountDetailsResponse = await chainRestAuthApi.fetchAccount(address);

    return {
      accountNumber: parseInt(
        accountDetailsResponse.account.base_account.account_number
      ),
      sequence: parseInt(accountDetailsResponse.account.base_account.sequence),
    };
  }

  private async getAccountNumberAndSequenceEvmos(
    address: string,
    chainID: string
  ) {
    const preferredRestEndpoint =
      this.endpointOptions[chainID]?.rest ?? "https://rest.bd.evmos.org:1317";

    const response = await axios.get(
      `${preferredRestEndpoint}/cosmos/auth/v1beta1/accounts/${address}`
    );

    const accountNumber = response.data.account.base_account
      .account_number as number;
    const sequence = response.data.account.base_account.sequence as number;

    return {
      accountNumber,
      sequence,
    };
  }

  private getGasAmountForMessage(message: MultiChainMsg) {
    if (message.msg_type_url === "/cosmwasm.wasm.v1.MsgExecuteContract") {
      if (message.chain_id === "neutron-1") {
        return "2400000";
      }
      return "1200000";
    }
    return "280000";
  }
}
