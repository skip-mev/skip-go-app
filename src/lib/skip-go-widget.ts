import { SwapWidgetProviderProps } from "@skip-go/widget/build/provider";

export const endpointOptions: SwapWidgetProviderProps["endpointOptions"] = {
  getRpcEndpointForChain: async (chainID) => {
    return `/api/rpc/${chainID}`;
  },
  getRestEndpointForChain: async (chainID) => {
    return `/api/rest/${chainID}`;
  },
};

export const apiURL = `/api/skip`;
