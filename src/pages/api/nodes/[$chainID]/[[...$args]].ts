import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { getCorsDomains } from "@/lib/edge-config";
import { getPolkachuAuthHeader } from "@/utils/api";
import { raise } from "@/utils/assert";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    if (req.method === "OPTIONS" && process.env.NODE_ENV === "production") {
      const allowedDomains = await getCorsDomains();
      if (allowedDomains.length > 0) {
        const origin = req.headers.get("origin") || "";
        if (!allowedDomains.includes(origin)) {
          return new Response(null, {
            status: 403,
            statusText: "Forbidden",
          });
        }
        return new Response(null, {
          headers: {
            "access-control-allow-credentials": "true",
            "access-control-allow-headers": `Accept,Accept-Version,Content-Length,Content-MD5,Content-Type,Date,X-Api-Version,X-CSRF-Token,X-Requested-With`,
            "access-control-allow-methods": "GET,DELETE,OPTIONS,PATCH,POST,PUT",
            "access-control-allow-origin": origin,
          },
          status: 204,
          statusText: "No Content",
        });
      }
    }
  } catch {
    //
  }

  const { searchParams } = req.nextUrl.clone();

  const chainID = searchParams.get("$chainID") || raise("chainID is required");
  searchParams.delete("$chainID");

  const args = searchParams.getAll("$args");
  searchParams.delete("$args");

  const rpcURL = `https://${chainID}-skip-rpc.polkachu.com`;
  const search = searchParams.toString();

  const proxyDest = [rpcURL, ...args].join("/") + (search ? `?${search}` : "");

  return fetch(proxyDest, {
    body: req.body,
    headers: {
      authorization: getPolkachuAuthHeader(),
    },
    method: req.method,
  });
}
