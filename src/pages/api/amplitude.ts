// pages/api/amplitude.ts

import { NextApiRequest, NextApiResponse } from "next";

const AMPLITUDE_HOST = "api2.amplitude.com";
const AMPLITUDE_PATH = "/2/httpapi";
const ALLOWED_PATH = "/api/amplitude";

const AMPLITUDE_API_KEY = process.env.AMPLITUDE_API_KEY;

export const route = ALLOWED_PATH;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      throw new Error("Payload must be { events: Array }");
    }

    const payload = {
      api_key: AMPLITUDE_API_KEY,
      events,
    };

    const upstream = `https://${AMPLITUDE_HOST}${AMPLITUDE_PATH}`;
    const ampRes = await fetch(upstream, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!ampRes.ok) {
      const text = await ampRes.text();
      throw new Error(`Amplitude error ${ampRes.status}: ${text}`);
    }

    // mirror success
    return res.status(200).json({});
  } catch (err) {
    console.error("Error proxying to Amplitude:", err);
    return res.status(500).json({ error: "Error proxying to Amplitude" });
  }
}
