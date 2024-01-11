import { ChainId } from "@/chains";
import { MergedWalletClient } from "@/lib/cosmos-kit";

export async function isWalletClientUsingLedger<T extends MergedWalletClient>(
  walletClient: T,
  chainID: ChainId,
) {
  if (!("client" in walletClient)) {
    return false;
  }

  // Keplr | Leap | Okxwallet | Vectis | XDEFI
  if ("getKey" in walletClient.client) {
    const key = await walletClient.client.getKey(chainID);
    return key.isNanoLedger;
  }

  // Station
  if ("keplr" in walletClient.client) {
    const key = await walletClient.client.keplr.getKey(chainID);
    return key.isNanoLedger;
  }

  // Cosmostation
  if ("cosmos" in walletClient.client) {
    const account = await walletClient.client.cosmos.request({
      method: "cos_account",
      params: { chainName: chainID },
    });
    return Boolean(account.isLedger);
  }

  return false;
}
