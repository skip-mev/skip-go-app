import { z } from "zod";

interface Args {
  coingeckoId: string;
}

export async function getUsdPrice({ coingeckoId }: Args) {
  const endpoint = `https://coins.llama.fi/prices/current/coingecko:${coingeckoId}`;

  const response = await fetch(endpoint);
  const data = await response.json();

  const { coins } = await priceResponseSchema.parseAsync(data);

  return coins[`coingecko:${coingeckoId}`].price;
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
