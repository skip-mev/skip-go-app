export interface MemeCoin {
  symbol: string;
  name: string;
  chainId: string;
  address?: string;
  logoURI?: string;
  category: 'trending' | 'popular' | 'new' | 'top-gainers';
  volume24h?: number;
  priceChange24h?: number;
}

export const MEME_COINS: MemeCoin[] = [
  // Trending Meme Coins
  {
    symbol: 'DOGE',
    name: 'Dogecoin',
    chainId: 'dogecoin',
    address: 'doge',
    category: 'trending',
    logoURI: 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png',
  },
  {
    symbol: 'SHIB',
    name: 'Shiba Inu',
    chainId: 'ethereum',
    address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    category: 'trending',
    logoURI: 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  },
  {
    symbol: 'PEPE',
    name: 'Pepe',
    chainId: 'ethereum',
    address: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    category: 'trending',
    logoURI: 'https://assets.coingecko.com/coins/images/29850/large/pepe-token.jpeg',
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    chainId: 'solana',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    category: 'trending',
    logoURI: 'https://assets.coingecko.com/coins/images/28600/large/bonk.jpg',
  },
  
  // Popular Meme Coins
  {
    symbol: 'WIF',
    name: 'dogwifhat',
    chainId: 'solana',
    address: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    category: 'popular',
    logoURI: 'https://assets.coingecko.com/coins/images/33767/large/dogwifhat.jpg',
  },
  {
    symbol: 'FLOKI',
    name: 'Floki Inu',
    chainId: 'ethereum',
    address: '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E',
    category: 'popular',
    logoURI: 'https://assets.coingecko.com/coins/images/16746/large/floki.png',
  },
  {
    symbol: 'BABYDOGE',
    name: 'Baby Doge Coin',
    chainId: 'bsc',
    address: '0xc748673057861a797275CD8A068AbB95A902e8de',
    category: 'popular',
    logoURI: 'https://assets.coingecko.com/coins/images/16125/large/babydoge.jpg',
  },
  
  // New/Emerging
  {
    symbol: 'MEME',
    name: 'Memecoin',
    chainId: 'ethereum',
    address: '0xb131f4A55907B10d1F0A50d8ab8FA09EC342cd74',
    category: 'new',
    logoURI: 'https://assets.coingecko.com/coins/images/32616/large/memecoin.png',
  },
  {
    symbol: 'POPCAT',
    name: 'Popcat',
    chainId: 'solana',
    address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
    category: 'new',
    logoURI: 'https://assets.coingecko.com/coins/images/33654/large/popcat.png',
  },
  
  // Top Gainers (would be dynamic in real app)
  {
    symbol: 'NEIRO',
    name: 'Neiro',
    chainId: 'ethereum',
    address: '0x812Ba41e071C7b7fA4EBcFB62dF5F45f6fA853Ee',
    category: 'top-gainers',
    logoURI: 'https://assets.coingecko.com/coins/images/33854/large/neiro.png',
  },
];

export const CATEGORY_LABELS = {
  trending: '🔥 Trending',
  popular: '⭐ Popular', 
  new: '🚀 New & Emerging',
  'top-gainers': '📈 Top Gainers',
} as const;

export function getMemeCoinsbyCategory(category: MemeCoin['category']): MemeCoin[] {
  return MEME_COINS.filter(coin => coin.category === category);
}

export function getAllMemeCoins(): MemeCoin[] {
  return MEME_COINS;
}