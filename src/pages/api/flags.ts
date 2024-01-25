import { PageConfig } from "next";

import { getExperimentalFeatures } from "@/lib/edge-config";

export const config: PageConfig = {
  runtime: "edge",
};

export default async function handler() {
  try {
    const flags = await getExperimentalFeatures();
    return new Response(JSON.stringify(flags), {
      headers: {
        "cache-control": "public, s-maxage=1, stale-while-revalidate",
        "content-type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);
    return new Response(null, { status: 500 }); // Internal Server Error
  }
}
