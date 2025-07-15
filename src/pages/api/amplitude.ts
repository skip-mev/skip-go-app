import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

const mapTargetUrl = (path: string[]) => {
  const joined = path.join("/");
  if (joined.startsWith("2/httpapi")) {
    return `https://api2.amplitude.com/${joined}`;
  }
  if (joined.startsWith("upload")) {
    return `https://s.ax.amplitude.com/${joined}`;
  }
  if (joined.startsWith("config")) {
    return `https://sr-client-cfg.amplitude.com/${joined}`;
  }
  return null;
};
const getRawBody = (req: NextApiRequest): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const path = (req.query.path || []) as string[];
  const target = mapTargetUrl(path);

  if (!target) {
    res.status(400).json({ error: "Unsupported Amplitude proxy path" });
    return;
  }

  const rawBody = req.method !== "GET" && req.method !== "HEAD" ? await getRawBody(req) : undefined;

  const proxyRes = await fetch(target + (req.url?.includes("?") ? "?" + req.url.split("?")[1] : ""), {
    method: req.method,
    headers: Object.fromEntries(
      Object.entries(req.headers).filter(([key]) => key.toLowerCase() !== "host"),
    ) as HeadersInit,
    body: rawBody,
  });

  const proxyBuffer = await proxyRes.arrayBuffer();

  proxyRes.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.status(proxyRes.status).send(Buffer.from(proxyBuffer));
}
