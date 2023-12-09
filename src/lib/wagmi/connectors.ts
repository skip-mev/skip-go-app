import { InjectedConnector } from "@wagmi/core";

export class OkxWalletConnector extends InjectedConnector {
  readonly name = "OKX Wallet";
  async getProvider() {
    if (typeof window === "undefined") return;
    return window.okexchain?.ethereum ?? window.ethereum;
  }
}
