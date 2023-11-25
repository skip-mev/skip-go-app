import { PageConfig } from "next";
import { NextRequest } from "next/server";

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
