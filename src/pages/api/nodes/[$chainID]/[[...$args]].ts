import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { chainRecord } from "@/chains/chains";
import { ALLOWLIST_LAVENDER_FIVE_CHAIN_IDS, ALLOWLIST_POLKACHU_BACKUP_CHAIN_IDS } from "@/constants/endpoints";
import { getCorsDomains } from "@/lib/edge-config";
import { getPolkachuAuthHeader, hasPolkachuAuth } from "@/utils/api";
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
      const allowedDomains = (await getCorsDomains()) ?? [];
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
            "access-control-max-age": "86400", // 24 hours
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

  const shouldUseL5 = ALLOWLIST_LAVENDER_FIVE_CHAIN_IDS.includes(chainID);
  const shouldUsePolkachuBackup = ALLOWLIST_POLKACHU_BACKUP_CHAIN_IDS.includes(chainID);

  const headers = new Headers();
  const isPrivate = hasPolkachuAuth();

  let rpcURL: string | undefined;
  if (shouldUseL5) {
    rpcURL = `https://skip-secretnetwork-rpc.lavenderfive.com`;
  } else if (isPrivate) {
    rpcURL = shouldUsePolkachuBackup
      ? `https://${chainID}-skip-rpc-1.polkachu.com`
      : `https://${chainID}-skip-rpc.polkachu.com`;
    headers.set("authorization", getPolkachuAuthHeader());
  } else {
    rpcURL = chainRecord[chainID]?.apis?.rpc?.[0]?.address;
  }

  if (!rpcURL) {
    return new Response(null, { status: 404 }); // Not Found
  }

  const search = searchParams.toString();
  const proxyDest = [rpcURL, ...args].join("/") + (search ? `?${search}` : "");

  return fetch(proxyDest, {
    body: req.body,
    headers,
    method: req.method,
  });
}
