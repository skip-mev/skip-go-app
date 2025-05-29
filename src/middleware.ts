import { createClient } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";

import { cleanOrigin, edgeConfigResponse, isPreview } from "./utils/api";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, solana-client, sentry-trace, baggage",
};

// Donetsk and Luhansk Regions of Ukraine, Russia, Crimea, Cuba, Iran, North Korea or Syria
const BLOCKED_COUNTRY = ["RU", "CU", "IR", "KP", "SY"];

const geoBlockMiddleware = (request: NextRequest) => {
  if (request.nextUrl.pathname === "/") {
    const country = request.geo?.country || "US";

    if (
      BLOCKED_COUNTRY.includes(country) ||
      (country == "UA" && request.geo?.city && request.geo?.city in ["Donetsk", "Luhansk", "Crimea"])
    ) {
      request.nextUrl.pathname = "/blocked";
      return NextResponse.rewrite(request.nextUrl);
    }

    return NextResponse.next();
  }
};

const corsMiddleware = async (request: NextRequest) => {
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";

  if (!process.env.ALLOWED_LIST_EDGE_CONFIG) {
    console.error("ALLOWED_LIST_EDGE_CONFIG is not set");

    return NextResponse.next();
  }
  const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
  const whitelistedDomains = await (async () => {
    const domain = cleanOrigin(origin) || "";
    if (isPreview(domain)) {
      const allowedPreviewData = await client.get("new-preview-namespace");
      const allowedPreview = await edgeConfigResponse.parseAsync(allowedPreviewData);
      const isAllowed = allowedPreview[domain];
      if (isAllowed) {
        return isAllowed;
      }
    }

    const allowedOriginsData = await client.get("new-allowed-origins");
    const allowedOrigins = await edgeConfigResponse.parseAsync(allowedOriginsData);
    const isAllowed = allowedOrigins[domain];
    if (isAllowed) {
      return isAllowed;
    }
    return undefined;
  })();
  const headers = new Headers(request.headers);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(whitelistedDomains && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  if (whitelistedDomains) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    headers.set(key, value);
  });

  const response = NextResponse.next({
    headers: headers,
  });

  return response;
};

export async function middleware(request: NextRequest) {
  geoBlockMiddleware(request);
  const response = await corsMiddleware(request);
  // response = abTestMiddleware(request, response);
  return response;
}

export const config = {
  matcher: ["/api/(.*)", "/"],
};
