// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createClient } from "@vercel/edge-config";
import type { NextApiRequest } from "next";
import { PageConfig } from "next";

import { API_URL } from "@/constants/api";
import { cleanOrigin, edgeConfigResponse, isPreview } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: NextApiRequest) {
  try {
    const splitter = "/api/skip/";
    const origin = req.cookies["origin"];
    console.warn("origin", origin);
    const [...args] = req.url!.split(splitter).pop()!.split("/");
    const uri = [API_URL, ...args].join("/");
    const headers = new Headers();
    if (!origin) {
      throw new Error("Origin is missing");
    }

    // const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
    // const whitelistedDomains = await (async () => {
    //   const domain = cleanOrigin(origin) || "";
    //   if (isPreview(domain)) {
    //     const allowedPreviewData = await client.get("testing-namespace");
    //     const allowedPreview = await edgeConfigResponse.parseAsync(allowedPreviewData);
    //     const apiKey = allowedPreview[domain];
    //     if (apiKey) {
    //       return apiKey;
    //     }
    //   }

    //   const allowedOriginsData = await client.get("testing-origins");
    //   const allowedOrigins = await edgeConfigResponse.parseAsync(allowedOriginsData);
    //   const apiKey = allowedOrigins[domain];
    //   if (apiKey) {
    //     return apiKey;
    //   }
    //   return undefined;
    // })();

    // if (whitelistedDomains?.apiKey) {
    //   console.warn("Using whitelisted API key for request", whitelistedDomains?.apiKey);
    //   headers.set("authorization", whitelistedDomains?.apiKey);
    // } else if (process.env.SKIP_API_KEY) {
    //   headers.set("authorization", process.env.SKIP_API_KEY);
    // }
    headers.set("Keep-Trace", "true");
    return fetch(uri, {
      body: req.body,
      method: req.method,
      headers,
    });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { status: 500 });
  }
}
