import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { chainRecord } from "@/chains/chains";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const chainID = req.nextUrl.searchParams.get("chainID");
  if (!chainID) {
    return new Response(null, { status: 404 }); // Not Found
  }
  const { fees } = chainRecord[chainID];

  const ft = fees?.fee_tokens?.[0];
  if (!(ft && ft.average_gas_price && ft.denom)) {
    return new Response(null, { status: 404 }); // Not Found
  }

  return new Response(`${ft.average_gas_price}${ft.denom}`, {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "text/plain",
    },
  });
}
