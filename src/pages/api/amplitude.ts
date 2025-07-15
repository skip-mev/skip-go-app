import type { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let rawBody = "";
  req.on("data", (chunk) => {
    rawBody += chunk;
  });

  req.on("end", async () => {
    try {
      const amplitudeRes = await fetch("https://api2.amplitude.com/2/httpapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: rawBody,
      });

      const result = await amplitudeRes.text();
      res.status(amplitudeRes.status).send(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Proxy error" });
    }
  });
}
