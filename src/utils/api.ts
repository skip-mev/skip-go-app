import { NextRequest } from "next/server";
import { z } from "zod";

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

      if (fallbackFn) {
        const { endpoint } = await fallbackFn(chainID);
        if (!endpoint) throw new Error(`No endpoint found for chainID: ${chainID}`);
        const endpoints = data?.endpoint ? [data.endpoint, ...endpoint] : endpoint;
        const workingEndpoint = await findFirstWorkingEndpoint(endpoints, type === "rpc" ? "rpc" : "rest");
        if (!workingEndpoint) throw new Error(`No working endpoint found for chainID: ${chainID}`);
        data = { endpoint: workingEndpoint, isPrivate: false };
      }

      if (!data) {
        return new Response(null, { status: 404 }); // Not Found
      }

      if (data.isApiKey && data.endpoint) {
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

export const edgeConfigResponse = z.record(
  z.object({
    clientName: z.string().optional(),
    apiKey: z.string().optional(),
  }),
);

export const cleanOrigin = (str: string) => {
  try {
    const url = new URL(str);
    let domain = url.hostname;

    // Remove www.
    if (domain.startsWith("www.")) {
      domain = domain.slice(4);
    }

    return domain;
  } catch (error) {
    return str; // Return the original string if it's not a valid URL
  }
};

export const isVercelPreview = (str: string) => {
  if (str.endsWith("vercel.app")) {
    return true;
  }
  return false;
};

export const isNetlifyPreview = (str: string) => {
  if (str.endsWith("netlify.app")) {
    return true;
  }
  return false;
};

export const isCloudflarePreview = (str: string) => {
  if (str.endsWith("pages.dev") || str.endsWith("trycloudflare.com")) {
    return true;
  }
  return false;
};

export const isPreview = (str: string) => {
  if (isVercelPreview(str) || isCloudflarePreview(str) || isNetlifyPreview(str)) {
    return true;
  }
  return false;
};
