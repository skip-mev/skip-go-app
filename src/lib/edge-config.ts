import { createClient } from "@vercel/edge-config";

export async function getCorsDomains() {
  const client = createClient(process.env.CORS_EDGE_CONFIG!);
  const value = await client.get<string[]>("domains");
  if (Array.isArray(value)) return value;
  return [];
}
