import {
  AccountData,
  DirectSignResponse,
  makeSignBytes,
} from "@cosmjs/proto-signing";
import { PrivateKey } from "./PrivateKey";
import { PublicKey } from "./PublicKey";
import { CosmosTxV1Beta1Tx } from "@injectivelabs/sdk-ts";
import { TxPayload } from "@evmos/transactions";
import { ethers } from "ethers";
import { createTxRaw } from "@evmos/proto";

export class DirectEthSecp256k1Wallet {
  public static async fromKey(privKey: PrivateKey, prefix = "inj") {
    const publicKey = privKey.toPublicKey().toPubKeyBytes();

    const privateKey = privKey.toPrivateKeyHex().slice(2);

    return new DirectEthSecp256k1Wallet(
      Uint8Array.from(Buffer.from(privateKey, "hex")),
      publicKey,
      prefix
    );
  }

  private readonly privateKey: PrivateKey;

  private readonly publicKey: PublicKey;

  private readonly prefix: string;

  private constructor(privKey: Uint8Array, pubKey: Uint8Array, prefix: string) {
    this.privateKey = PrivateKey.fromHex(Buffer.from(privKey).toString("hex"));
    this.publicKey = PublicKey.fromBytes(pubKey);
    this.prefix = prefix;
  }

  private get address(): string {
    return this.publicKey.toAddress().toBech32("evmos");
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    return [
      {
        // @ts-ignore
        algo: "eth_secp256k1",
        address: this.address,
        pubkey: this.publicKey.toPubKeyBytes(),
      },
    ];
  }

  public async sign(address: string, tx: TxPayload) {
    const dataToSign = `0x${Buffer.from(
      tx.signDirect.signBytes,
      "base64"
    ).toString("hex")}`;

    const signatureRaw = this.privateKey.wallet
      ._signingKey()
      .signDigest(dataToSign);
    const splitedSignature = ethers.utils.splitSignature(signatureRaw);
    const signature = ethers.utils.arrayify(
      ethers.utils.concat([splitedSignature.r, splitedSignature.s])
    );

    const signedTx = createTxRaw(
      tx.signDirect.body.toBinary(),
      tx.signDirect.authInfo.toBinary(),
      [signature]
    );

    return signedTx.message;
  }

  public async signDirect(
    address: string,
    signDoc: Omit<CosmosTxV1Beta1Tx.SignDoc, "accountNumber"> & {
      accountNumber: Long;
    }
  ): Promise<DirectSignResponse> {
    const signBytes = makeSignBytes(signDoc);

    if (address !== this.address) {
      throw new Error(`Address ${address} not found in wallet`);
    }

    const signature = await this.privateKey.signEcda(Buffer.from(signBytes));

    return {
      signed: signDoc,
      signature: {
        pub_key: {
          type: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
          value: this.publicKey.toBase64(),
        },
        signature: Buffer.from(signature).toString("base64"),
      },
    };
  }
}
