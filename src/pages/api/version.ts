import { PageConfig } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

export const route = "/api/version";

export const version = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

export default function handler() {
  if (!version) {
    return new Response("No version found", { status: 500 });
  }
  return new Response(version, {
    headers: {
      "cache-control": "s-maxage=1, stale-while-revalidate",
      "content-type": "text/plain",
    },
  });
}
