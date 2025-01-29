import { NextApiRequest, NextApiResponse } from "next";

const SENTRY_HOST = "o4504768725909504.ingest.us.sentry.io";
const SENTRY_PROJECT_IDS = ["4508485201231872"];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const requestBody = req.body;
    const encoder = new TextEncoder();
    const envelopeBytes = encoder.encode(requestBody);
    const [headerPiece] = requestBody.split("\n");
    const header = JSON.parse(headerPiece);
    const dsn = new URL(header["dsn"]);
    const project_id = dsn.pathname?.replace("/", "");

    if (dsn.hostname !== SENTRY_HOST) {
      throw new Error(`Invalid sentry hostname: ${dsn.hostname}`);
    }

    if (!project_id || !SENTRY_PROJECT_IDS.includes(project_id)) {
      throw new Error(`Invalid sentry project id: ${project_id}`);
    }

    const upstream_sentry_url = `https://${SENTRY_HOST}/api/${project_id}/envelope/`;

    const response = await fetch(upstream_sentry_url, {
      method: "POST",
      body: envelopeBytes,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });

    console.log(response);

    res.status(response.status).json({});
  } catch (e) {
    console.error("Error tunneling to Sentry:", e);
    res.status(500).json({ error: "Error tunneling to Sentry" });
  }
}