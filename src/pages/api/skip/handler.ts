// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import cookie from "cookie";
import { NextApiRequest, PageConfig } from "next";

import { API_URL } from "@/constants/api";

export const config: PageConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  },
  runtime: "edge",
};

export default async function handler(req: NextApiRequest) {
  try {
    const splitter = "/api/skip/";

    const cookies = cookie.parse(req.headers.cookie || "");
    const apiKey = cookies["x-api-key"];

    const [...args] = req.url!.split(splitter).pop()!.split("/");
    const uri = [API_URL, ...args].join("/");
    const headers = new Headers();
    if (apiKey) {
      headers.set("authorization", apiKey);
    }
    console.warn("headers:", JSON.stringify(req.headers));
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
