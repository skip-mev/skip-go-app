import { z } from "zod";

interface Args {
  coingeckoId: string;
}

const cache = new Map<string, number>();

export async function getUsdPrice({ coingeckoId }: Args) {
  const cached = cache.get(coingeckoId);
  if (cached) return cached;

  const endpoint = `https://coins.llama.fi/prices/current/coingecko:${coingeckoId}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  const { coins } = await priceResponseSchema.parseAsync(data);
  const { price } = coins[`coingecko:${coingeckoId}`];

  cache.set(coingeckoId, price);
  return price;
}

const priceResponseSchema = z.object({
  coins: z.record(
    z.object({
      price: z.number(),
      symbol: z.string(),
      timestamp: z.number(),
      confidence: z.number(),
    }),
  ),
});
