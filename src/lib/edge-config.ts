if (typeof window !== "undefined") {
  throw new Error("edge-config.ts should only be imported on the server");
}

import { ExperimentalFeature } from "@skip-router/core";
import { createClient } from "@vercel/edge-config";

const client = createClient(process.env.NEXT_PUBLIC_EDGE_CONFIG!);

export async function getCorsDomains() {
  try {
    const key = "domains";
    const value = await client.get<string[]>(key);
    if (Array.isArray(value)) {
      return value;
    }
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

    const value = await client.get<ExperimentalFeature[]>(key);
    if (Array.isArray(value)) {
      return value;
    }
  } catch (error) {
    console.error(error);
  }
}
