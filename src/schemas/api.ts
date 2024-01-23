import { z } from "zod";

export const contactFormSchema = z.object({
  txHash: z.string(),
  submitChain: z.string().min(4),
  signerAddress: z.string(),
  name: z.string(),
  email: z.string().email(),
  message: z.string().optional(),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

export const explorerResponseSchema = z.object({
  evm: z.boolean(),
  explorer: z.string(),
});

export type ExplorerResponse = z.infer<typeof explorerResponseSchema>;
