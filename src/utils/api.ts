import { NextRequest } from "next/server";

import { type FallbackEndpointFn, getWhitelabelEndpoint } from "@/config/endpoints";

import { findFirstWorkingEndpoint } from "./endpoint";

export function createProxyHandler(type: "api" | "rpc", fallbackFn?: FallbackEndpointFn) {
  return async function handler(req: NextRequest) {
    try {
      const splitter = (() => {
        if (type === "api") return "/api/rest/";
        if (type === "rpc") return "/api/rpc/";
        throw new Error(`createProxyHandler error: unknown handler type '${type}'`);
      })();

      const [chainID, ...args] = req.url.split(splitter).pop()!.split("/");

      let data = getWhitelabelEndpoint(chainID, type);

      if (!data && fallbackFn) {
        const { endpoint } = await fallbackFn(chainID);
        if (!endpoint) throw new Error(`No endpoint found for chainID: ${chainID}`);
        const workingEndpoint = await findFirstWorkingEndpoint(endpoint, type === "rpc" ? "rpc" : "rest");
        if (!workingEndpoint) throw new Error(`No working endpoint found for chainID: ${chainID}`);
        data = { endpoint: workingEndpoint, isPrivate: false };
      }

      if (!data) {
        return new Response(null, { status: 404 }); // Not Found
      }

      if (data.isApiKey && data.endpoint && typeof data.endpoint === "string") {
        const url = new URL(data.endpoint);
        url.searchParams.set("api-key", process.env.HELIUS_API_KEY!);
        return fetch(url, {
          body: req.body,
          method: req.method,
        });
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
