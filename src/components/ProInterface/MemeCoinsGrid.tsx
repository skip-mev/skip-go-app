import { useState } from "react";
import { FireIcon, StarIcon, RocketLaunchIcon, ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import { cn } from "@/utils/ui";
import { MEME_COINS, CATEGORY_LABELS, getMemeCoinsbyCategory, type MemeCoin } from "@/config/memeCoins";

interface MemeCoinsGridProps {
  onCoinSelect: (coin: MemeCoin) => void;
  selectedCoin?: MemeCoin | null;
}

const categoryIcons = {
  trending: FireIcon,
  popular: StarIcon,
  new: RocketLaunchIcon,
  'top-gainers': ArrowTrendingUpIcon,
};

export function MemeCoinsGrid({ onCoinSelect, selectedCoin }: MemeCoinsGridProps) {
  const [activeCategory, setActiveCategory] = useState<MemeCoin['category']>('trending');
  
  const coins = getMemeCoinsbyCategory(activeCategory);

  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-1">
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => {
          const Icon = categoryIcons[category as MemeCoin['category']];
          const isActive = activeCategory === category;
          
          return (
            <button
              key={category}
              onClick={() => setActiveCategory(category as MemeCoin['category'])}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200",
                "border text-xs font-medium",
                isActive 
                  ? "bg-violet9 border-violet8 text-white" 
                  : "bg-blackA5 border-whiteA6 text-white/80 hover:bg-blackA6 hover:border-violet8"
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          );
        })}
      </div>

      {/* Coins Grid */}
      <div className="grid grid-cols-4 gap-2">
        {coins.map((coin) => {
          const isSelected = selectedCoin?.symbol === coin.symbol;
          
          return (
            <button
              key={`${coin.symbol}-${coin.chainId}`}
              onClick={() => onCoinSelect(coin)}
              className={cn(
                "p-2 rounded-lg transition-all duration-200",
                "border backdrop-blur",
                isSelected
                  ? "bg-violet9/20 border-violet8 ring-1 ring-violet8/50"
                  : "bg-blackA5/50 border-whiteA6 hover:bg-blackA6/50 hover:border-violet8"
              )}
            >
              <div className="flex flex-col items-center text-center gap-1">
                {coin.logoURI && (
                  <img
                    src={coin.logoURI}
                    alt={coin.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="w-full">
                  <div className="font-bold text-white text-xs">{coin.symbol}</div>
                  <div className="text-white/60 text-[10px] truncate leading-tight">{coin.name}</div>
                </div>
                {isSelected && (
                  <div className="w-1.5 h-1.5 bg-violet9 rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      
      {coins.length === 0 && (
        <div className="text-center py-8 text-white/50">
          No coins found in this category
        </div>
      )}
    </div>
  );
}