import { ChainId } from "@/chains/types";
import { MergedWalletClient } from "@/lib/cosmos-kit";

export async function getOfflineSigner<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
) {
  if ("getOfflineSigner" in walletClient && walletClient.getOfflineSigner) {
    return walletClient.getOfflineSigner(chainId);
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have 'getOfflineSigner'`,
  );
}
