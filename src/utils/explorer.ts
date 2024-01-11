import { explorersRecord } from "@/chains/explorers";

const explorerCache = new Map<string, (txHash: string) => string>();
export async function getChainExplorerUrl(chainId: string) {
  const cached = explorerCache.get(chainId);
  if (cached) return cached;

  const parsedIntId = parseInt(chainId);
  const isEvmChain = typeof parsedIntId === "number" && !isNaN(parsedIntId);

  if (isEvmChain) {
    const { EVM_CHAINS } = await import("@/constants/wagmi");
    const chain = EVM_CHAINS.find((chain) => chain.id === parseInt(chainId));
    if (chain?.blockExplorers?.default.url) {
      const explorer = (txHash: string) => {
        return `${chain.blockExplorers!.default.url}/tx/${txHash}`;
      };
      explorerCache.set(chainId, explorer);
      return explorer;
    }
  }

  const explorers = explorersRecord[chainId] || [];

  const mintscan = explorers.find((explorer) => explorer.kind === "mintscan");
  if (mintscan && mintscan.tx_page) {
    const explorer = (txHash: string) => {
      return mintscan.tx_page!.replace("${txHash}", txHash);
    };
    explorerCache.set(chainId, explorer);
    return explorer;
  }

  if (explorers[0]?.tx_page) {
    // return explorers[0].tx_page.replace("${txHash}", txHash);
    const explorer = (txHash: string) => {
      return explorers[0].tx_page!.replace("${txHash}", txHash);
    };
    explorerCache.set(chainId, explorer);
    return explorer;
  }

  return null;
}
