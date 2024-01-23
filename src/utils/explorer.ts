import { explorerResponseSchema } from "@/schemas/api";

export interface ChainExplorerResponse {
  evm: boolean;
  explorer: string;
}

export async function getExplorerUrl(chainId: string) {
  const response = await fetch(`/api/explorer/${chainId}`);
  if (!response.ok) return;
  const data = await response.json();
  const { evm, explorer } = await explorerResponseSchema.parseAsync(data);
  if (evm) {
    return (txHash: string) => `${explorer}/tx/${txHash}`;
  } else {
    return (txHash: string) => `${explorer.replace("${txHash}", txHash)}`;
  }
}
