import { PageConfig } from "next";
import { NextRequest } from "next/server";

import { explorersRecord } from "@/chains/explorers";
import { ExplorerResponse } from "@/schemas/api";
import { raise } from "@/utils/assert";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  try {
    let baseUrl: string | undefined;
    const chainId = req.nextUrl.searchParams.get("chainId") || raise("/api/explorer error: 'chainId' is required");

    const parsedIntId = parseInt(chainId);
    const isEvmChain = typeof parsedIntId === "number" && !isNaN(parsedIntId);

    if (isEvmChain) {
      const { EVM_CHAINS } = await import("@/constants/wagmi");
      const chain = EVM_CHAINS.find((chain) => chain.id === parseInt(chainId));
      if (chain?.blockExplorers?.default.url) {
        baseUrl = chain.blockExplorers!.default.url;
      }
    } else {
      const explorers = explorersRecord[chainId] || [];

      baseUrl ||= explorers.find((explorer) => explorer.kind === "mintscan")?.tx_page;
      baseUrl ||= explorers[0]?.tx_page;
    }

    if (!baseUrl) {
      return new Response(null, { status: 404 }); // Not Found
    }

    const payload: ExplorerResponse = {
      evm: isEvmChain,
      explorer: baseUrl,
    };

    return new Response(JSON.stringify(payload), {
      headers: {
        "cache-control": "public, max-age=604800, immutable", // 1 week
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 }); // Internal Server Error
  }
}
