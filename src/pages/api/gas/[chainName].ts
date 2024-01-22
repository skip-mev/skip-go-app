import { FeeAsset } from "@skip-router/core";
import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { chainRecord } from "@/chains/chains";
import { chainNameToId } from "@/chains/types";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const chainName = chainNameToId[req.nextUrl.searchParams.get("chainName") || ""];
  if (!chainName) {
    return new Response(null, { status: 404 }); // Not Found
  }
  const { fees } = chainRecord[chainName];

  const feeAssets: FeeAsset[] =
    fees?.fee_tokens.map((ft) => ({
      denom: ft.denom,
      gasPrice: {
        low: (ft.low_gas_price ?? 0.01).toString(),
        average: (ft.average_gas_price ?? 0.025).toString(),
        high: (ft.high_gas_price ?? 0.04).toString(),
      },
    })) ?? [];

  return new Response(JSON.stringify(feeAssets), {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "application/json",
    },
  });
}
