import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { chainRecord } from "@/chains/chains";
import { getWhitelabelEndpoint } from "@/config/endpoints";
import { getPolkachuAuthHeader } from "@/utils/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    const [chainID, ...args] = req.url.split("/api/rest/").pop()!.split("/");

    const endpoint = getWhitelabelEndpoint(chainID, "api") ?? chainRecord[chainID]?.apis?.rest?.[0]?.address;
    if (!endpoint) {
      return new Response(null, { status: 404 }); // Not Found
    }

    const headers = new Headers();
    if (endpoint.includes("skip-api") && endpoint.endsWith(".polkachu.com")) {
      headers.set("authorization", getPolkachuAuthHeader());
    }

    const uri = [endpoint, ...args].join("/");
    return fetch(uri, {
      body: req.body,
      headers,
      method: req.method,
    });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { status: 500 }); // Internal Server Error
  }
}
