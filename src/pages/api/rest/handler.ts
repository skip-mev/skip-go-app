import { PageConfig } from "next";

import chains from "@/chains/rest.json";
import { createProxyHandler } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default createProxyHandler("api", (chainID) => ({
  endpoint: chains.find((chain) => chain.chainId === chainID)?.rest,
  isPrivate: false,
}));
