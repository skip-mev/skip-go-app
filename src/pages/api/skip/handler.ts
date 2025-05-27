// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { PageConfig } from "next";

import { API_URL } from "@/constants/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const splitter = "/api/skip/";

    const apiKey = req.headers.get("x-api-key");
    const [...args] = req.url!.split(splitter).pop()!.split("/");
    const uri = [API_URL, ...args].join("/");
    const headers = new Headers();
    if (apiKey) {
      headers.set("authorization", apiKey);
    }
    console.warn("headers:", req.headers);
    console.warn("API Key:", apiKey);
    return fetch(uri, {
      body: req.body,
      method: req.method,
      headers,
    });
  } catch (error) {
    const data = JSON.stringify({ error });
    return new Response(data, { status: 500 });
  }
}
