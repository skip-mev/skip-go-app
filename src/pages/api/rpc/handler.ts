import { PageConfig } from "next";

import chains from "@/chains/all-chains.json";
import { createProxyHandler } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default createProxyHandler("rpc", (chainID) => ({
  endpoint: chains.find((chain) => chain.chainId === chainID)?.rpc,
  isPrivate: false,
}));
