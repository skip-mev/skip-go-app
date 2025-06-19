import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

import { PriceChart } from "./PriceChart";
import { TokenSearch } from "./TokenSearch";
import { MemeCoinsGrid } from "./MemeCoinsGrid";
import { TradingWidget } from "./TradingWidget";
import type { MemeCoin } from "@/config/memeCoins";

interface ProInterfaceProps {
  isOpen: boolean;
}

export function ProInterface({ isOpen }: ProInterfaceProps) {
  const [selectedToken, setSelectedToken] = useState<{
    symbol: string;
    name: string;
    chainId?: string;
  } | null>(null);
  
  const [selectedMemeCoin, setSelectedMemeCoin] = useState<MemeCoin | null>(null);
  const [activeTab, setActiveTab] = useState<'meme' | 'search'>('meme');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleMemeCoinSelect = (coin: MemeCoin) => {
    setSelectedMemeCoin(coin);
    setSelectedToken({
      symbol: coin.symbol,
      name: coin.name,
      chainId: coin.chainId,
    });
    // Don't auto-collapse for meme coins - user wants to browse
  };

  const handleTokenSelect = (token: { symbol: string; name: string; chainId?: string }) => {
    setSelectedToken(token);
    setSelectedMemeCoin(null); // Clear meme coin selection
    setIsExpanded(false); // Auto-collapse after search selection
  };

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col">
      {/* Main 2-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
        {/* Left Column - Integrated Trading */}
        <div className="flex flex-col">
          {/* Trading Status */}
          {selectedMemeCoin && (
            <div className="mb-3 p-3 bg-violet9/10 backdrop-blur rounded-lg border border-violet8/30">
              <div className="flex items-center gap-3">
                {selectedMemeCoin.logoURI && (
                  <img
                    src={selectedMemeCoin.logoURI}
                    alt={selectedMemeCoin.symbol}
                    className="w-6 h-6 rounded-full"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="text-sm">
                  <span className="text-white font-medium">Trading </span>
                  <span className="text-violet11 font-bold">{selectedMemeCoin.symbol}</span>
                  <span className="text-white/60 ml-2">with USDC</span>
                </div>
              </div>
            </div>
          )}

          {/* Token Discovery Section */}
          <div className="mb-4">
            {/* Compact Tab Navigation */}
            <div className="flex mb-3">
              <div className="flex bg-blackA5 rounded-lg p-1 w-full">
                <button
                  onClick={() => {
                    setActiveTab('meme');
                    setIsExpanded(true); // Always expand when switching to meme coins
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 text-sm ${
                    activeTab === 'meme'
                      ? 'bg-violet9 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  🚀 Meme Coins
                </button>
                <button
                  onClick={() => {
                    setActiveTab('search');
                    setIsExpanded(true); // Expand when switching to search
                  }}
                  className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 text-sm ${
                    activeTab === 'search'
                      ? 'bg-violet9 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  🔍 Search
                </button>
              </div>
            </div>

            {/* Token Selection */}
            <div className="bg-blackA3/50 backdrop-blur rounded-xl border border-whiteA3">
              {/* Collapsed View - Show Selected Search Token Only */}
              {!isExpanded && selectedToken && !selectedMemeCoin && (
                <div className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-violet9/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 bg-violet9 rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm">
                        {selectedToken.symbol}
                      </div>
                      <div className="text-white/60 text-xs truncate">
                        {selectedToken.name} (selected)
                      </div>
                      <div className="text-white/40 text-[10px] mt-0.5">
                        <div className="truncate">
                          Chain: <span className="text-violet11">{selectedToken.chainId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Expanded View - Full Selection */}
              {isExpanded && (
                <div className={`p-3 ${
                  activeTab === 'search' ? 'h-60 overflow-y-auto scrollbar-thin scrollbar-track-blackA3 scrollbar-thumb-whiteA6 hover:scrollbar-thumb-whiteA8' : ''
                }`}>
                  {activeTab === 'meme' ? (
                    <MemeCoinsGrid 
                      onCoinSelect={handleMemeCoinSelect} 
                      selectedCoin={selectedMemeCoin}
                    />
                  ) : (
                    <TokenSearch onTokenSelect={handleTokenSelect} />
                  )}
                </div>
              )}
              
              {/* Expand/Collapse Button - Only for Search Tab */}
              {activeTab === 'search' && (
                <div className="border-t border-whiteA3">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full p-2 flex items-center justify-center gap-1 text-xs text-white/60 hover:text-white/80 transition-colors"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUpIcon className="w-3 h-3" />
                        <span>Collapse</span>
                      </>
                    ) : (
                      <>
                        <ChevronDownIcon className="w-3 h-3" />
                        <span>Search more tokens</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trading Widget */}
          <div className="flex-1">
            <h2 className="text-lg font-bold text-white mb-3">Trade</h2>
            <TradingWidget selectedCoin={selectedMemeCoin} />
          </div>
        </div>

        {/* Right Column - Price Chart */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-white mb-3">
            {selectedToken ? `${selectedToken.symbol} Chart` : "Price Chart"}
          </h2>
          {selectedToken ? (
            <div className="flex-1 bg-blackA3/50 backdrop-blur rounded-xl p-4 border border-whiteA3 min-h-0">
              <PriceChart token={selectedToken} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center rounded-xl bg-blackA3/50 backdrop-blur border border-whiteA3">
              <p className="text-white/50">Select a token to view its price chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
