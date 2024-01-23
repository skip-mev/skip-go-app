import { PageConfig } from "next";
import { NextRequest } from "next/server";
import { Resend } from "resend";

import { contactFormSchema } from "@/schemas/api";

export const config: PageConfig = {
  runtime: "edge",
};

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not set");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextRequest) {
  if (req.method !== "POST") {
    return new Response(null, { status: 405 }); // Method Not Allowed
  }

  const formData = await req.formData();
  const entries = Object.fromEntries(formData.entries());
  const payload = await contactFormSchema.parseAsync(entries);

  const emails = (process.env.CONTACT_FORM_DEST || "support@skip.money").split(",").filter(Boolean);

  const { data, error } = await resend.emails.send({
    from: `support+ingest@skip.money`,
    reply_to: `<${payload.email}>`,
    to: emails,
    subject: `ibc.fun issue on ${payload.submitChain}`,
    text: `
Name: ${payload.name}
Email: ${payload.email}
Transaction Hash: ${payload.txHash}
Signer Account Address: ${payload.signerAddress}
Message: ${!payload.message ? "-" : ""}

${payload.message || ""}`,
  });

  if (!data || error) {
    console.error(error);
    return new Response(null, { status: 500 }); // Internal Server Error
  }

  console.log(data);
  return new Response(null, { status: 200 }); // OK
}
