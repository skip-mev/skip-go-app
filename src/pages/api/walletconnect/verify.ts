import { PageConfig } from "next";

export const config: PageConfig = {
  runtime: "edge",
};

export default function handler() {
  if (!process.env.WALLETCONNECT_VERIFY_KEY) {
    return new Response(null, { status: 404 });
  }
  return new Response(process.env.WALLETCONNECT_VERIFY_KEY, {
    headers: {
      "cache-control": "public, max-age=31536000, immutable",
      "content-type": "text/plain",
    },
  });
}
