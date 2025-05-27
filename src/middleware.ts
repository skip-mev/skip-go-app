import { createClient } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, solana-client, sentry-trace, baggage, x-api-key",
};

const cleanOrigin = (str: string) => {
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

const isVercelPreview = (str: string) => {
  if (str.endsWith("vercel.app")) {
    return true;
  }
  return false;
};

const isNetlifyPreview = (str: string) => {
  if (str.endsWith("netlify.app")) {
    return true;
  }
  return false;
};

const isCloudflarePreview = (str: string) => {
  if (str.endsWith("pages.dev") || str.endsWith("trycloudflare.com")) {
    return true;
  }
  return false;
};

const isPreview = (str: string) => {
  if (isVercelPreview(str) || isCloudflarePreview(str) || isNetlifyPreview(str)) {
    return true;
  }
  return false;
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
  const apiKey = await (async () => {
    const domain = cleanOrigin(origin) || "";
    if (isPreview(domain)) {
      const allowedPreviewData = await client.get("testing-namespace");
      const allowedPreview = await stringRecordSchema.parseAsync(allowedPreviewData);
      const apiKey = allowedPreview[domain];
      if (apiKey) {
        return apiKey;
      }
    }

    const allowedOriginsData = await client.get("testing-origins");
    const allowedOrigins = await stringRecordSchema.parseAsync(allowedOriginsData);
    const apiKey = allowedOrigins[domain];
    if (apiKey) {
      return apiKey;
    }
    return undefined;
  })();
  const headers = new Headers(request.headers);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(apiKey && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  if (apiKey) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    headers.set(key, value);
  });
  console.warn("cleanOrigin:", cleanOrigin(origin));
  console.warn("CORS Origin:", origin);
  console.warn("middleware API Key:", apiKey);

  const response = NextResponse.next({
    headers: headers,
  });
  if (apiKey) {
    response.cookies.set("x-api-key", apiKey, {
      httpOnly: true,
      secure: true,
      path: "/api",
      maxAge: 60, // 1 min
    });
  }
  return response;
};

export async function middleware(request: NextRequest) {
  geoBlockMiddleware(request);
  const response = await corsMiddleware(request);
  // response = abTestMiddleware(request, response);
  return response;
}

const stringRecordSchema = z.record(z.string());

export const config = {
  matcher: ["/api/(.*)", "/"],
};
