import { NextRequest } from "next/server";

import { type FallbackEndpointFn, getWhitelabelEndpoint } from "@/config/endpoints";

export function createProxyHandler(type: "api" | "rpc", fallbackFn?: FallbackEndpointFn) {
  return async function handler(req: NextRequest) {
    try {
      const [chainID, ...args] = req.url.split(`/api/${type}/`).pop()!.split("/");

      let data = getWhitelabelEndpoint(chainID, type);
      fallbackFn && (data ??= await fallbackFn(chainID));

      if (!data) {
        return new Response(null, { status: 404 }); // Not Found
      }

      const headers = new Headers();
      if (data.isPrivate) {
        headers.set("authorization", getPrivateAuthHeader());
      }

      const uri = [data.endpoint, ...args].join("/");
      return fetch(uri, {
        body: req.body,
        headers,
        method: req.method,
      });
    } catch (error) {
      const data = JSON.stringify({ error });
      return new Response(data, { status: 500 }); // Internal Server Error
    }
  };
}

export function getPrivateAuthHeader() {
  if (!(process.env.POLKACHU_USER && process.env.POLKACHU_PASSWORD)) {
    throw new Error("env POLKACHU_USER or POLKACHU_PASSWORD is not set");
  }
  const userpass = `${process.env.POLKACHU_USER}:${process.env.POLKACHU_PASSWORD}`;
  return `Basic ${Buffer.from(userpass).toString("base64")}`;
}
