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

      if (data && data.isApiKey && data.endpoint) {
        const url = new URL(data.endpoint);
        url.searchParams.set("api-key", process.env.HELIUS_API_KEY!);
        return fetch(url, {
          body: req.body,
          headers: {
            "Content-Type": "application/json",
          },
          method: req.method,
        });
      }

      if (fallbackFn) {
        const { endpoint } = await fallbackFn(chainID);
        if (data && data.endpoint && data.isPrivate) {
          try {
            const privateNodeResponse = await fetch(data.endpoint, {
              headers: {
                "User-Agent": getWhitelabelUserAgent(),
              },
            });
            if (privateNodeResponse.ok) {
              data = { endpoint: data.endpoint, isPrivate: true };
            } else {
              throw new Error(`Private node endpoint failed: ${privateNodeResponse.statusText}`);
            }
          } catch (error) {
            if (!endpoint) {
              throw new Error(`No endpoint found for chainID: ${chainID}`);
            }
            const workingEndpoint = await findFirstWorkingEndpoint(endpoint, type === "rpc" ? "rpc" : "rest");
            if (!workingEndpoint) throw new Error(`No working endpoint found for chainID: ${chainID}`);
            data = { endpoint: workingEndpoint, isPrivate: false };
          }
        } else {
          if (!endpoint) {
            throw new Error(`No endpoint found for chainID: ${chainID}`);
          }
          const workingEndpoint = await findFirstWorkingEndpoint(endpoint, type === "rpc" ? "rpc" : "rest");
          if (!workingEndpoint) throw new Error(`No working endpoint found for chainID: ${chainID}`);
          data = { endpoint: workingEndpoint, isPrivate: false };
        }
      }

      if (!data) {
        return new Response(null, { status: 404 }); // Not Found
      }

      const headers = new Headers();
      headers.set("Content-Type", "application/json");
      if (data.isPrivate) {
        headers.set("User-Agent", getWhitelabelUserAgent());
      }

      const uri = [data.endpoint, ...args].join("/");
      return fetch(uri, {
        body: req.body,
        headers,
        method: req.method,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return new Response(JSON.stringify({ error: message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  };
}

export function getWhitelabelUserAgent() {
  if (!process.env.WHITELABEL_KEY) {
    throw new Error("env WHITELABEL_KEY is not set");
  }
  return process.env.WHITELABEL_KEY;
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

export const isWorkersDev = (str: string) => {
  if (str.endsWith("workers.dev")) {
    return true;
  }
  return false;
};

export const isIngress = (str: string) => {
  if (str.includes("ingress")) {
    return true;
  }
  return false;
};

export const isVercelPreview = (str: string) => {
  if (str.includes("vercel.app")) {
    return true;
  }
  return false;
};

export const isNetlifyPreview = (str: string) => {
  if (str.includes("netlify.app")) {
    return true;
  }
  return false;
};

export const isCloudflarePreview = (str: string) => {
  if (str.includes("pages.dev") || str.includes("trycloudflare.com")) {
    return true;
  }
  return false;
};

export const isAmplifyPreview = (str: string) => {
  if (str.includes("amplifyapp.com")) {
    return true;
  }
  return false;
};

export const isPreview = (str: string) => {
  if (
    isVercelPreview(str) ||
    isCloudflarePreview(str) ||
    isNetlifyPreview(str) ||
    isIngress(str) ||
    isWorkersDev(str) ||
    isAmplifyPreview(str)
  ) {
    return true;
  }
  return false;
};
