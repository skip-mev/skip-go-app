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

export default createProxyHandler("api", (chainID) => ({
  endpoint: chainRecord[chainID]?.apis?.rest?.[0]?.address,
  isPrivate: false,
}));
