import { createClient } from "@vercel/edge-config";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const corsOptions = {
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function middleware(request: NextRequest) {
  // Check the origin from the request
  const origin = request.headers.get("origin") ?? "";

  if (!process.env.ALLOWED_LIST_EDGE_CONFIG) {
    throw new Error("NEXT_PUBLIC_EDGE_CONFIG is not set");
  }
  const client = createClient(process.env.ALLOWED_LIST_EDGE_CONFIG);
  const allowedOriginsData = await client.get("allowed-origins");
  const allowedOrigins = await stringArraySchema.parseAsync(allowedOriginsData);
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Handle preflighted requests
  const isPreflight = request.method === "OPTIONS";

  if (isPreflight) {
    const preflightHeaders = {
      ...(isAllowedOrigin && { "Access-Control-Allow-Origin": origin }),
      ...corsOptions,
    };
    return NextResponse.json({}, { headers: preflightHeaders });
  }

  // Handle simple requests
  const response = NextResponse.next();

  if (isAllowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  Object.entries(corsOptions).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

const stringArraySchema = z.array(z.string()).default([]);

export const config = {
  matcher: "/api/(.*)",
};
