import { SwapWidgetProviderProps } from "@skip-go/widget";

import { appUrl } from "@/constants/api";

export const endpointOptions: SwapWidgetProviderProps["endpointOptions"] = {
  getRpcEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rpc/${chainID}`;
  },
  getRestEndpointForChain: async (chainID) => {
    return `${appUrl}/api/rest/${chainID}`;
  },
};

export const apiURL = `${appUrl}/api/skip`;
