import { NextApiRequest, NextApiResponse } from "next";

export interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  thumb: string;
  market_cap_rank: number;
  price_btc: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use CoinGecko's free trending endpoint
    const response = await fetch(
      "https://api.coingecko.com/api/v3/search/trending",
      {
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract trending coins and format them
    const trendingCoins = data.coins.map((item: any) => ({
      id: item.item.id,
      symbol: item.item.symbol.toUpperCase(),
      name: item.item.name,
      thumb: item.item.thumb,
      market_cap_rank: item.item.market_cap_rank,
      price_btc: item.item.price_btc,
    }));

    res.status(200).json({
      trending: trendingCoins,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching trending coins:", error);
    
    // Return fallback data if API fails
    res.status(200).json({
      trending: [],
      error: "Failed to fetch trending data",
      timestamp: new Date().toISOString(),
    });
  }
}