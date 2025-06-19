import { assets as chainAssets } from "chain-registry";
import { NextApiRequest, NextApiResponse } from "next";

interface TokenResult {
  symbol: string;
  name: string;
  address?: string;
  chainId?: string;
  logoURI?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Query parameter 'q' is required" });
  }

  const searchTerm = q.toLowerCase();

  try {
    const results: TokenResult[] = [];

    // Search through all chain registry assets (including CW20, ERC20, etc.)
    for (const chainAsset of chainAssets) {
      for (const asset of chainAsset.assets) {
        if (asset.symbol.toLowerCase().includes(searchTerm) || asset.name.toLowerCase().includes(searchTerm)) {
          results.push({
            symbol: asset.symbol,
            name: asset.name,
            address: asset.address,
            chainId: chainAsset.chain_name,
            logoURI: asset.logo_URIs?.png || asset.logo_URIs?.svg,
          });
        }
      }
    }

    // Limit results to prevent large payloads
    const limitedResults = results.slice(0, 20);

    res.status(200).json(limitedResults);
  } catch (error) {
    console.error("Error searching tokens:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
