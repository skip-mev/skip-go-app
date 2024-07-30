import { bech32mAddress } from "@penumbra-zone/bech32m/penumbra";
import { ViewService } from "@penumbra-zone/protobuf";
import { MinimalWallet, SwapWidgetProviderProps } from "@skip-go/widget";
import toast from "react-hot-toast";

import { appUrl } from "@/constants/api";

import { createPraxClient, isPraxInstalled, requestPraxAccess } from "./prax";

export const endpointOptions: SwapWidgetProviderProps["endpointOptions"] = {
  getRpcEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rpc/${chainID}`;
  },
  getRestEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rest/${chainID}`;
  },
};

export const apiURL = `${appUrl}/api/skip`;

export const praxWallet: MinimalWallet = {
  walletName: "prax",
  walletPrettyName: "Prax Wallet",
  walletInfo: {
    logo: "https://raw.githubusercontent.com/prax-wallet/web/e8b18f9b997708eab04f57e7a6c44f18b3cf13a8/apps/extension/public/prax-white-vertical.svg",
  },
  connect: async () => {
    console.error("Prax wallet is not supported for connect");
    toast.error("Prax wallet is not supported for connect");
  },
  getAddress: async (props) => {
    const penumbraWalletIndex = props?.penumbraWalletIndex;
    try {
      const isInstalled = await isPraxInstalled();
      if (!isInstalled) {
        throw new Error("Prax Wallet is not installed");
      }
      await requestPraxAccess();
      const praxClient = createPraxClient(ViewService);
      const address = await praxClient.addressByIndex({
        addressIndex: {
          account: penumbraWalletIndex ? penumbraWalletIndex : 0,
        },
      });
      if (!address.address) throw new Error("No address found");
      const bech32Address = bech32mAddress(address.address);
      return bech32Address;
    } catch (error) {
      console.error(error);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      toast.error(error?.message);
    }
  },
  disconnect: async () => {
    console.error("Prax wallet is not supported");
  },
  isWalletConnected: false,
};
