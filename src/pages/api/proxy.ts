import httpProxy from "http-proxy";
import { NextApiRequest, NextApiResponse } from "next";

const proxy = httpProxy.createProxyServer();

export const config = {
  api: {
    bodyParser: false,
  },
};

function proxyHandler(req: NextApiRequest, res: NextApiResponse) {
  return new Promise((_, reject) => {
    const chainID = req.query.chainID as string;

    if (req.url) {
      req.url = req.url.split(chainID)[1];
    }

    const rpcURL = `https://${chainID}-skip-rpc.polkachu.com`;

    proxy.once("error", reject);

    proxy.web(req, res, {
      target: rpcURL,
      autoRewrite: false,
      changeOrigin: true,
      auth: `${process.env.POLKACHU_USER}:${process.env.POLKACHU_PASSWORD}`,
    });
  });
}

export default proxyHandler;
