import { RouteRequest, SkipRouter } from "@skip-router/core";
import { waitFor } from "@testing-library/react";

import { API_URL, APP_URL } from "@/constants/api";

export const createRoute = async (options: RouteRequest) => {
  const skipClient = new SkipRouter({
    clientID: process.env.NEXT_PUBLIC_CLIENT_ID,
    apiURL: API_URL,
    endpointOptions: {
      getRpcEndpointForChain: async (chainID) => {
        return `${APP_URL}/api/rpc/${chainID}`;
      },
      getRestEndpointForChain: async (chainID) => {
        return `${APP_URL}/api/rest/${chainID}`;
      },
    },
  });
  const route = await skipClient.route(options);
  await waitFor(() => expect(route).toBeTruthy(), {
    timeout: 10000,
  });

  if (!route) {
    throw new Error("useRoute hook returned no data");
  }
  return route;
};
