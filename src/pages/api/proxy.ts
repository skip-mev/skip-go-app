import httpProxy from "http-proxy";
import { NextApiRequest, NextApiResponse, PageConfig } from "next";

import { raise } from "@/utils/assert";

const proxy = httpProxy.createProxyServer();

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((_, reject) => {
    const chainID =
      typeof req.query.chainID === "string"
        ? req.query.chainID
        : raise("chainID is required");

    console.log(req.url);
    if (req.url) {
      req.url = req.url.split(chainID)[1];
    }

    const rpcURL = `https://${chainID}-skip-rpc.polkachu.com`;

    proxy.once("error", reject);

    proxy.once("proxyRes", (proxyRes) => {
      proxyRes.headers["access-control-allow-origin"] = "*";
    });

    proxy.web(req, res, {
      auth: `${process.env.POLKACHU_USER}:${process.env.POLKACHU_PASSWORD}`,
      changeOrigin: true,
      target: rpcURL,
    });
  });
}
