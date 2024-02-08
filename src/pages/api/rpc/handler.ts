import { PageConfig } from "next";

import { chainRecord } from "@/chains/chains";
import { createProxyHandler } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default createProxyHandler("rpc", (chainID) => ({
  endpoint: chainRecord[chainID]?.apis?.rpc?.[0]?.address,
  isPrivate: false,
}));
