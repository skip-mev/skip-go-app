import type { ExperimentalFeature } from "@skip-router/core";
import { createClient } from "@vercel/edge-config";

export async function getCorsDomains(): Promise<string[]> {
  try {
    const client = createClient(process.env.CORS_EDGE_CONFIG!);
    const value = await client.get<string[]>("domains");
    if (Array.isArray(value)) return value;
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getClientFlags(): Promise<ExperimentalFeature[]> {
  try {
    if (process.env.NEXT_PUBLIC_FLAGS_OVERRIDE) {
      const value = process.env.NEXT_PUBLIC_FLAGS_OVERRIDE.split(",").filter(Boolean) as ExperimentalFeature[];
      return value;
    }
    const client = createClient(process.env.NEXT_PUBLIC_FLAGS_EDGE_CONFIG!);
    const value = await client.get<ExperimentalFeature[]>("experimentalFeatures");
    if (Array.isArray(value)) return value;
    return [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
