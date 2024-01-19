import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { getChainlistURI } from "@/utils/chain";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const chainName = req.nextUrl.searchParams.get("chainName") || "";
  let response = await fetch(chainName ? getChainlistURI(chainName) : FALLBACK_URI);
  if (!response.ok) {
    response = await fetch(FALLBACK_URI);
  }
  return new Response(response.body, {
    headers: {
      "cache-control": "public, max-age=604800, immutable", // 1 week
      "content-type": response.headers.get("content-type")!,
    },
  });
}

const FALLBACK_URI = "https://api.dicebear.com/6.x/shapes/svg";
