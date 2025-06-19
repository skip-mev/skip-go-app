import { useMemo, useState, useEffect } from "react";
import { defaultTheme, lightTheme, Widget } from "widgetv2";
import { useTheme } from "@/hooks/useTheme";
import { useFeatureEnabled } from "@/hooks/useFeatureEnabled";
import { apiURL, endpointOptions } from "@/lib/skip-go-widget";
import type { MemeCoin } from "@/config/memeCoins";

interface TradingWidgetProps {
  selectedCoin?: MemeCoin | null;
}

// Chain ID mapping for Skip Go widget
const getChainId = (chainName: string): string => {
  const mapping: Record<string, string> = {
    'noble': 'noble-1',
    'solana': 'solana',
    'ethereum': '1', // Ethereum mainnet
    'bsc': '56', // BSC mainnet
    'dogecoin': 'dogecoin',
    'polygon': '137',
    'arbitrum': '42161',
    'optimism': '10',
  };
  return mapping[chainName.toLowerCase()] || chainName;
};

// Asset denomination mapping
const getAssetDenom = (coin: MemeCoin): string => {
  // Use address if available, otherwise use symbol in lowercase
  if (coin.address) {
    return coin.address;
  }
  // For some chains, we might need specific formats
  switch (coin.chainId.toLowerCase()) {
    case 'dogecoin':
      return 'udoge';
    case 'solana':
      return coin.symbol.toLowerCase();
    default:
      return coin.symbol.toLowerCase();
  }
};

export function TradingWidget({ selectedCoin }: TradingWidgetProps) {
  const theme = useTheme();
  const goFast = useFeatureEnabled("goFastEnabled");
  const [widgetKey, setWidgetKey] = useState(0);

  // Force widget re-mount when coin changes
  useEffect(() => {
    setWidgetKey(prev => prev + 1);
  }, [selectedCoin]);

  // Create dynamic route that updates when coin is selected
  const defaultRoute = useMemo(() => {
    if (!selectedCoin) {
      // Return undefined when no coin selected - let widget use its defaults
      return undefined;
    }

    const destChainId = getChainId(selectedCoin.chainId);
    const destAssetDenom = getAssetDenom(selectedCoin);
    
    const route = {
      srcChainId: "noble-1",
      srcAssetDenom: "uusdc",
      destChainId: destChainId,
      destAssetDenom: destAssetDenom,
      amountIn: 1000000,
      amountOut: undefined,
    };


    return route;
  }, [selectedCoin]);

  if (!theme) return null;

  return (
    <div className="h-full">
      <div className="bg-blackA2 rounded-xl border border-whiteA3 overflow-hidden h-full">
        {selectedCoin ? (
          <Widget
            key={`selected-${widgetKey}`}
            theme={theme === "dark" ? defaultTheme : lightTheme}
            endpointOptions={endpointOptions}
            apiUrl={apiURL}
            defaultRoute={defaultRoute}
            routeConfig={{
              goFast,
            }}
            onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
          />
        ) : (
          <Widget
            key={`default-${widgetKey}`}
            theme={theme === "dark" ? defaultTheme : lightTheme}
            endpointOptions={endpointOptions}
            apiUrl={apiURL}
            routeConfig={{
              goFast,
            }}
            onlyTestnet={process.env.NEXT_PUBLIC_IS_TESTNET}
          />
        )}
      </div>
    </div>
  );
}