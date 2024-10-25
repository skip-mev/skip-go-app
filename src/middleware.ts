import { createClient } from "@vercel/edge-config";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, solana-client",
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
  if (str.endsWith("pages.dev")) {
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

const TREATMENT_BUCKET_PERCENTAGE = 0.5;
const COOKIE_NAME = "ab-test"; // name of the cookie to store the variant

const abTestMiddleware = (request: NextRequest, response: NextResponse) => {
  const randomlySetBucket: RequestCookie =
    Math.random() < TREATMENT_BUCKET_PERCENTAGE
      ? {
          name: COOKIE_NAME,
          value: "new",
        }
      : {
          name: COOKIE_NAME,
          value: "old",
        };

  const url = request.nextUrl.clone();

  const RequestCookie = request.cookies.get(COOKIE_NAME) || randomlySetBucket;

  if (RequestCookie.value === "new") {
    url.pathname = "/widgetv2";
    response = NextResponse.rewrite(url);
  }

  if (!request.cookies.get(COOKIE_NAME)) {
    response.cookies.set(RequestCookie);
  }
  return response;
};

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
}

const corsMiddleware = async (request: NextRequest, response: NextResponse) => {
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";

  if (!process.env.ALLOWED_LIST_EDGE_CONFIG) {
    console.error("ALLOWED_LIST_EDGE_CONFIG is not set");

    return NextResponse.next();
  }
  const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
  const isAllowed = await (async () => {
    const domain = cleanOrigin(origin) || "";
    if (isPreview(domain)) {
      const allowedPreviewData = await client.get("preview-namespace");
      const allowedPreview = await stringArraySchema.parseAsync(allowedPreviewData);
      if (allowedPreview.find((d) => domain.includes(d))) {
        return true;
      }
    }

    const allowedOriginsData = await client.get("allowed-origins");
    const allowedOrigins = await stringArraySchema.parseAsync(allowedOriginsData);
    return allowedOrigins.includes(domain);
  })();
  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";
  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowed && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  if (isAllowed) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next();

  geoBlockMiddleware(request);
  response = await corsMiddleware(request, response);
  // response = abTestMiddleware(request, response);
  
  return response;
}

const stringArraySchema = z.array(z.string()).default([]);

export const config = {
  matcher: ["/api/(.*)", "/"],
};
