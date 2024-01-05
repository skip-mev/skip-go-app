import { ChainId } from "@/chains/types";
import { MergedWalletClient } from "@/lib/cosmos-kit";

export async function getAddressForCosmosChain<T extends MergedWalletClient>(
  walletClient: T,
  chainId: ChainId,
) {
  if ("getOfflineSigner" in walletClient && walletClient.getOfflineSigner) {
    const signer = await walletClient.getOfflineSigner(chainId);
    const accounts = await signer.getAccounts();
    return accounts[0].address;
  }

  if ("getAccount" in walletClient && walletClient.getAccount) {
    const account = await walletClient.getAccount(chainId);
    return account.address;
  }

  if ("getSimpleAccount" in walletClient) {
    const account = await walletClient.getSimpleAccount(chainId);
    return account.address;
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have methods to resolve address`,
  );
}

// generic wrapper to support enabling chains on many different wallets
export async function enableChains<T extends MergedWalletClient>(
  walletClient: T,
  chains: string[],
) {
  // KeplrClient | LeapClient | OkxwalletClient | VectisClient | XDEFIClient
  if ("enable" in walletClient && walletClient.enable) {
    return walletClient.enable(chains);
  }

  // CosmostationClient
  if ("ikeplr" in walletClient) {
    return walletClient.ikeplr.enable(chains);
  }

  // CosmostationClient | KeplrClient | LeapClient
  if ("connect" in walletClient && walletClient.connect) {
    return walletClient.connect(chains);
  }

  // CosmosSnapClient
  if ("snapInstalled" in walletClient && walletClient.snapInstalled) {
    return walletClient.handleConnect();
  }

  // KeplrClient | LeapClient | OkxwalletClient | StationClient | VectisClient | XDEFIClient
  if ("client" in walletClient && "keplr" in walletClient.client) {
    return walletClient.client.keplr.enable(chains);
  }

  throw new Error(
    `unsupported wallet: current wallet client does not have methods to enable chains`,
  );
}
