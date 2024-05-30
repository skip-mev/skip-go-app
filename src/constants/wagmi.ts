import { defineChain } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  avalanche,
  avalancheFuji,
  base,
  baseSepolia,
  blast,
  blastSepolia,
  bsc,
  celo,
  Chain,
  fantom,
  filecoin,
  kava,
  linea,
  mainnet,
  manta,
  moonbeam,
  optimism,
  optimismSepolia,
  polygon,
  polygonMumbai,
  sepolia,
} from "wagmi/chains";

export const forma = /*#__PURE__*/ defineChain({
  id: 984122,
  name: "Forma Mainnet",
  nativeCurrency: { name: "TIA", symbol: "TIA", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://rpc.forma.art"],
    },
  },
  blockExplorers: {
    default: {
      name: "Etherscan",
      url: "https://lineascan.build",
      apiUrl: "https://api.lineascan.build/api",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 42,
    },
  },
  testnet: false,
});

export const EVM_CHAINS: Chain[] = [
  arbitrum,
  avalanche,
  base,
  bsc,
  celo,
  fantom,
  filecoin,
  kava,
  linea,
  mainnet,
  manta,
  moonbeam,
  optimism,
  polygon,
  polygonMumbai,
  sepolia,
  avalancheFuji,
  baseSepolia,
  optimismSepolia,
  arbitrumSepolia,
  blast,
  blastSepolia,
  forma,
];
