// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { createClient } from "@vercel/edge-config";
import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { API_URL } from "@/constants/api";
import { cleanOrigin, edgeConfigResponse, isPreview } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const splitter = "/api/skip/";
    const origin = req.headers.get("origin") ?? "";

    const [...args] = req.url!.split(splitter).pop()!.split("/");
    const uri = [API_URL, ...args].join("/");
    const headers = new Headers();

    if (!process.env.ALLOWED_LIST_EDGE_CONFIG) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Skipping CORS middleware in development mode");
        return fetch(uri, {
          body: req.body,
          method: req.method,
          headers,
        });
      }
      throw new Error("ALLOWED_LIST_EDGE_CONFIG is not set");
    }

    const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
    const whitelistedDomains = await (async () => {
      const domain = cleanOrigin(origin) || "";
      if (isPreview(domain)) {
        const allowedPreviewData = await client.get("new-preview-namespace");
        const allowedPreview = await edgeConfigResponse.parseAsync(allowedPreviewData);
        const apiKey = allowedPreview[domain];
        if (apiKey) {
          return apiKey;
        }
      }

      const allowedOriginsData = await client.get("new-allowed-origins");
      const allowedOrigins = await edgeConfigResponse.parseAsync(allowedOriginsData);
      const apiKey = allowedOrigins[domain];
      if (apiKey) {
        return apiKey;
      }
      return undefined;
    })();

    if (whitelistedDomains?.apiKey) {
      headers.set("authorization", whitelistedDomains?.apiKey);
    } else if (process.env.SKIP_API_KEY) {
      headers.set("authorization", process.env.SKIP_API_KEY);
    }
    headers.set("Keep-Trace", "true");
    return fetch(uri, {
      body: req.body,
      method: req.method,
      headers,
    });
  } catch (error) {
    console.error("Error in handler:", error);
    const data = JSON.stringify({ error });
    return new Response(data, { status: 500 });
  }
}
