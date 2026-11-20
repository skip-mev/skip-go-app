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

      if (data && data.isSolana && data.endpoint) {
        return await proxySolanaRequest(req, data.endpoint, data.fallbackEndpoint);
      }

      if (fallbackFn) {
        const { endpoint } = await fallbackFn(chainID);
        if (data && data.endpoint && data.isPrivate) {
          try {
            const healthCheckUrl =
              type === "api"
                ? new URL("cosmos/base/tendermint/v1beta1/node_info", data.endpoint).toString()
                : data.endpoint;
            const privateNodeResponse = await fetch(healthCheckUrl, {
              headers: {
                "User-Agent": getWhitelabelUserAgent(),
              },
            });
            await privateNodeResponse.body?.cancel();
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

async function proxySolanaRequest(req: NextRequest, heliusEndpoint: string, alchemyEndpoint?: string) {
  const heliusKey = process.env.HELIUS_API_KEY;
  const alchemyUrl =
    alchemyEndpoint && process.env.ALCHEMY_API_KEY ? `${alchemyEndpoint}/${process.env.ALCHEMY_API_KEY}` : undefined;
  if (!heliusKey && !alchemyUrl) {
    throw new Error("No Solana RPC API key configured (HELIUS_API_KEY / ALCHEMY_API_KEY)");
  }

  const requestInit = {
    body: req.method === "GET" || req.method === "HEAD" ? undefined : await req.text(),
    headers: { "Content-Type": "application/json" },
    method: req.method,
  };

  if (heliusKey) {
    const heliusUrl = new URL(heliusEndpoint);
    heliusUrl.searchParams.set("api-key", heliusKey);
    try {
      const response = await fetch(heliusUrl, requestInit);
      if (response.ok || !alchemyUrl) return response;
      console.warn(`Solana RPC helius responded with ${response.status}, falling back to alchemy`);
      await response.body?.cancel();
    } catch (error) {
      if (!alchemyUrl) throw error;
      console.warn("Solana RPC helius request failed, falling back to alchemy:", error);
    }
  }

  return fetch(alchemyUrl!, requestInit);
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
