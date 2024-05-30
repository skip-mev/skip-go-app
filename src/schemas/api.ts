import { z } from "zod";

export const explorerResponseSchema = z.object({
  evm: z.boolean(),
  explorer: z.string(),
});

export type ExplorerResponse = z.infer<typeof explorerResponseSchema>;
