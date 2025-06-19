import { useEffect, useRef } from "react";

interface PriceChartProps {
  token: {
    symbol: string;
    name: string;
    chainId?: string;
  };
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function PriceChart({ token }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => initWidget();
    document.head.appendChild(script);

    const initWidget = () => {
      if (containerRef.current && window.TradingView) {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: `${token.symbol}USD`,
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          container_id: containerRef.current.id,
          hide_top_toolbar: false,
          studies: ["MASimple@tv-basicstudies"],
          disabled_features: ["use_localstorage_for_settings"],
          enabled_features: ["study_templates"],
          overrides: {
            "mainSeriesProperties.showCountdown": false,
            "paneProperties.background": "#0a0a0a",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#1a1a1a",
            "paneProperties.horzGridProperties.color": "#1a1a1a",
            "scalesProperties.textColor": "#AAA",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          },
        });
      }
    };

    return () => {
      if (widgetRef.current) {
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      const scripts = document.querySelectorAll('script[src*="tradingview"]');
      scripts.forEach((script) => script.remove());
    };
  }, [token.symbol]);

  return (
    <div className="relative">
      <div
        id={`tradingview_${token.symbol}_${Date.now()}`}
        ref={containerRef}
        className="h-[500px] overflow-hidden rounded-lg bg-blackA3"
      />
      <div className="text-foreground/60 absolute bottom-4 right-4 rounded bg-black/80 px-3 py-1 text-xs backdrop-blur">
        Powered by TradingView
      </div>
    </div>
  );
}
