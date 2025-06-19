import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import { debounce } from "@/utils/debounce";
import { cn } from "@/utils/ui";

interface Token {
  symbol: string;
  name: string;
  address?: string;
  chainId?: string;
  logoURI?: string;
}

interface TokenSearchProps {
  onTokenSelect: (token: Token) => void;
}

export function TokenSearch({ onTokenSelect }: TokenSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    [],
  );

  useEffect(() => {
    debouncedSetSearchTerm(searchTerm);
  }, [searchTerm, debouncedSetSearchTerm]);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ["tokens", debouncedSearchTerm],
    queryFn: async () => {
      if (!debouncedSearchTerm) return [];

      try {
        const response = await fetch(`/api/search/tokens?q=${encodeURIComponent(debouncedSearchTerm)}`);
        if (!response.ok) throw new Error("Failed to fetch tokens");
        return response.json();
      } catch (error) {
        console.error("Error searching tokens:", error);
        return [];
      }
    },
    enabled: debouncedSearchTerm.length > 0,
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <MagnifyingGlassIcon className="text-white/50 absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tokens by name or symbol..."
          className={cn(
            "w-full rounded-lg py-3 pl-10 pr-4",
            "border border-whiteA6 bg-blackA5 text-white",
            "focus:ring-violet8 focus:outline-none focus:ring-2 focus:border-violet8",
            "placeholder:text-white/50",
          )}
        />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="border-violet11 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      )}

      {tokens.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs text-white/60 mb-2">
            {tokens.length} result{tokens.length !== 1 ? 's' : ''} found
          </div>
          {tokens.map((token: Token, index: number) => (
            <button
              key={`${token.symbol}-${token.chainId}-${index}`}
              onClick={() => onTokenSelect(token)}
              className={cn(
                "w-full rounded-lg p-3 text-left transition-all duration-200",
                "bg-blackA5 hover:bg-blackA6",
                "hover:border-violet8 border border-whiteA6",
                "focus:ring-violet8 focus:outline-none focus:ring-2",
              )}
            >
              <div className="flex items-center gap-3">
                {token.logoURI && (
                  <img
                    src={token.logoURI}
                    alt={token.symbol}
                    className="h-6 w-6 rounded-full flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{token.symbol}</div>
                  <div className="text-white/60 text-xs truncate">{token.name}</div>
                  <div className="text-white/40 text-[10px] mt-0.5">
                    <div className="truncate">
                      Chain: <span className="text-violet11">{token.chainId}</span>
                    </div>
                    {token.address && (
                      <div className="truncate font-mono">
                        {token.address.length > 20 
                          ? `${token.address.slice(0, 8)}...${token.address.slice(-8)}`
                          : token.address
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {debouncedSearchTerm && !isLoading && tokens.length === 0 && (
        <div className="text-white/50 py-8 text-center">No tokens found for &quot;{debouncedSearchTerm}&quot;</div>
      )}
    </div>
  );
}
