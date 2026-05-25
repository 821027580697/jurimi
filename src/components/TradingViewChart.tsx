"use client";

import { useEffect, useRef, memo } from "react";

interface Props {
  symbol: string;
  market: "KR" | "US";
}

function toTvSymbol(code: string, market: "KR" | "US"): string {
  if (market === "KR") return `KRX:${code}`;
  return code;
}

function TradingViewChart({ symbol, market }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const tvSymbol = toTvSymbol(symbol, market);

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: tvSymbol,
      interval: "D",
      timezone: "Asia/Seoul",
      theme: "light",
      style: "1",
      locale: "kr",
      backgroundColor: "rgba(255, 255, 255, 1)",
      gridColor: "rgba(240, 240, 240, 1)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: "https://www.tradingview.com",
      studies: ["MASimple@tv-basicstudies"],
      overrides: {
        "mainSeriesProperties.candleStyle.upColor": "#FF2D2D",
        "mainSeriesProperties.candleStyle.downColor": "#2D6CFF",
        "mainSeriesProperties.candleStyle.borderUpColor": "#FF2D2D",
        "mainSeriesProperties.candleStyle.borderDownColor": "#2D6CFF",
        "mainSeriesProperties.candleStyle.wickUpColor": "#FF2D2D",
        "mainSeriesProperties.candleStyle.wickDownColor": "#2D6CFF",
      },
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";

    container.appendChild(wrapper);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, market]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}
      style={{ height: "100%", width: "100%" }} />
  );
}

export default memo(TradingViewChart);
