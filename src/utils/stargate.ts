import { AccountParser } from "@cosmjs/stargate";
import { strideAccountParser } from "stridejs";

import { EthAccount } from "@/lib/ethermint/types";

export function getCustomAccountParser(chainID: string): AccountParser | undefined {
  if (chainID.includes("dymension_1100-1")) {
    return (input) => {
      if (input.typeUrl === EthAccount.typeUrl) {
        const account = EthAccount.decode(input.value);
        const baseEthAccount = account.baseAccount!;
        const pubKeyEth = baseEthAccount.pubKey;
        return {
          address: baseEthAccount.address,
          pubkey: pubKeyEth
            ? {
                type: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
                value: Buffer.from(pubKeyEth.value).toString("base64"),
              }
            : null,
          accountNumber: baseEthAccount.accountNumber.toNumber(),
          sequence: baseEthAccount.sequence.toNumber(),
        };
      }
      throw new Error(`Unsupported type: '${input.typeUrl}'`);
    };
  }

  if (chainID.includes("stride")) {
    return strideAccountParser;
  }
}
