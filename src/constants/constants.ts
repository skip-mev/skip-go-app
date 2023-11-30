import {
  arbitrum,
  avalanche,
  base,
  bsc,
  celo,
  Chain,
  fantom,
  filecoin,
  linea,
  mainnet,
  moonbeam,
  optimism,
  polygon,
  polygonMumbai,
} from "wagmi/chains";

export const EVM_WALLET_LOGOS: Record<string, string> = {
  safe: "https://raw.githubusercontent.com/rainbow-me/rainbowkit/6b460fcba954e155828e03f46228ee88a171a83b/packages/rainbowkit/src/wallets/walletConnectors/safeWallet/safeWallet.svg",
  walletConnect:
    "https://raw.githubusercontent.com/rainbow-me/rainbowkit/6b460fcba954e155828e03f46228ee88a171a83b/packages/rainbowkit/src/wallets/walletConnectors/walletConnectWallet/walletConnectWallet.svg",
  coinbaseWallet:
    "https://raw.githubusercontent.com/rainbow-me/rainbowkit/6b460fcba954e155828e03f46228ee88a171a83b/packages/rainbowkit/src/wallets/walletConnectors/coinbaseWallet/coinbaseWallet.svg",
  metaMask: "/metamask-logo.svg",
  injected:
    "https://raw.githubusercontent.com/rainbow-me/rainbowkit/6b460fcba954e155828e03f46228ee88a171a83b/packages/rainbowkit/src/wallets/walletConnectors/injectedWallet/injectedWallet.svg",
};

export const INJECTED_EVM_WALLET_LOGOS: Record<string, string> = {
  "OKX Wallet":
    "https://raw.githubusercontent.com/rainbow-me/rainbowkit/6b460fcba954e155828e03f46228ee88a171a83b/packages/rainbowkit/src/wallets/walletConnectors/okxWallet/okxWallet.svg",
};

export const kava = {
  id: 2222,
  name: "Kava",
  network: "kava",
  nativeCurrency: {
    decimals: 18,
    name: "Kava",
    symbol: "KAVA",
  },
  rpcUrls: {
    public: { http: ["https://evm.kava.io"] },
    default: { http: ["https://evm.kava.io"] },
  },
  blockExplorers: {
    etherscan: { name: "KavaScan", url: "https://kavascan.com" },
    default: { name: "KavaScan", url: "https://kavascan.com" },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 3661165,
    },
  },
} as const satisfies Chain;

export const EVM_CHAINS = [
  mainnet,
  arbitrum,
  base,
  filecoin,
  polygonMumbai,
  polygon,
  linea,
  moonbeam,
  avalanche,
  celo,
  bsc,
  optimism,
  fantom,
  kava,
];
