if (typeof window !== "undefined") {
  throw new Error("edge-config.ts should only be imported on the server");
}
import { ExperimentalFeature } from "@skip-router/core";
import { createClient } from "@vercel/edge-config";
import { z } from "zod";

export const configClient = createClient(process.env.NEXT_PUBLIC_EDGE_CONFIG!);

export async function getCorsDomains() {
  try {
    const key = "allowlist-domains";
    const data = await configClient.get(key);
    const value = await stringArraySchema.parseAsync(data);
    return value;
  } catch (error) {
    console.error(error);
  }
}

export async function getExperimentalFeatures() {
  try {
    const branch = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF;
    const key = (() => {
      switch (branch) {
        case "main":
          return "experimental-features";
        case "staging":
          return "experimental-features-staging";
        case "dev":
          return "experimental-features-dev";
        default:
          return "experimental-features";
      }
    })();

    const data = await configClient.get(key);
    const value = (await stringArraySchema.parseAsync(data)) as ExperimentalFeature[];
    return value;
  } catch (error) {
    console.error(error);
  }
}

const stringArraySchema = z.array(z.string()).default([]);
