"use client";

import { useEffect, useRef, memo } from "react";

interface Props {
  symbol: string;
  market: "KR" | "US";
}

const US_EXCHANGE_MAP: Record<string, string> = {
  AAPL: "NASDAQ", MSFT: "NASDAQ", NVDA: "NASDAQ", GOOGL: "NASDAQ", GOOG: "NASDAQ",
  AMZN: "NASDAQ", META: "NASDAQ", TSLA: "NASDAQ", AVGO: "NASDAQ", AMD: "NASDAQ",
  INTC: "NASDAQ", QCOM: "NASDAQ", MU: "NASDAQ", NFLX: "NASDAQ", COST: "NASDAQ",
  ADBE: "NASDAQ", CRM: "NYSE", INTU: "NASDAQ", NOW: "NYSE", SNOW: "NYSE",
  PLTR: "NASDAQ", DDOG: "NASDAQ", CRWD: "NASDAQ", PANW: "NASDAQ", ZS: "NASDAQ",
  ORCL: "NYSE", CSCO: "NASDAQ", PYPL: "NASDAQ", COIN: "NASDAQ", SOFI: "NASDAQ",
  HOOD: "NASDAQ", RBLX: "NYSE", SPOT: "NYSE", PINS: "NYSE", SNAP: "NYSE",
  UBER: "NYSE", ABNB: "NASDAQ", DASH: "NASDAQ", SHOP: "NYSE", MELI: "NASDAQ",
  FTNT: "NASDAQ", NET: "NYSE", TTD: "NASDAQ", WDAY: "NASDAQ", MDB: "NASDAQ",
  LRCX: "NASDAQ", AMAT: "NASDAQ", KLAC: "NASDAQ", MRVL: "NASDAQ", ON: "NASDAQ",
  ARM: "NASDAQ", ASML: "NASDAQ", TXN: "NASDAQ", SMCI: "NASDAQ",
  RKLB: "NASDAQ", RIVN: "NASDAQ", LCID: "NASDAQ", NIO: "NYSE",
  JPM: "NYSE", BAC: "NYSE", GS: "NYSE", MS: "NYSE", V: "NYSE", MA: "NYSE",
  WFC: "NYSE", C: "NYSE", AXP: "NYSE", BLK: "NYSE",
  UNH: "NYSE", JNJ: "NYSE", LLY: "NYSE", ABBV: "NYSE", MRK: "NYSE", PFE: "NYSE",
  TMO: "NYSE", ABT: "NYSE", AMGN: "NASDAQ", MRNA: "NASDAQ", ISRG: "NASDAQ",
  XOM: "NYSE", CVX: "NYSE", COP: "NYSE",
  BA: "NYSE", LMT: "NYSE", RTX: "NYSE", NOC: "NYSE", GD: "NYSE",
  CAT: "NYSE", DE: "NYSE", HON: "NASDAQ", GE: "NYSE",
  DIS: "NYSE", WMT: "NYSE", HD: "NYSE", NKE: "NYSE", MCD: "NYSE", SBUX: "NASDAQ",
  KO: "NYSE", PEP: "NASDAQ", PG: "NYSE",
  SPY: "AMEX", QQQ: "NASDAQ", DIA: "AMEX", IWM: "AMEX", VOO: "AMEX",
  TQQQ: "NASDAQ", SQQQ: "NASDAQ", SOXL: "AMEX", ARKK: "AMEX",
  GLD: "AMEX", TLT: "NASDAQ", SCHD: "AMEX",
};

function toTvSymbol(code: string, market: "KR" | "US"): string {
  if (market === "KR") return `KRX:${code}`;
  const exchange = US_EXCHANGE_MAP[code] || "NASDAQ";
  return `${exchange}:${code}`;
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
      gridColor: "rgba(242, 242, 242, 1)",
      hide_top_toolbar: false,
      hide_legend: false,
      allow_symbol_change: false,
      save_image: true,
      calendar: false,
      hide_volume: false,
      enable_publishing: false,
      withdateranges: true,
      details: true,
      studies: ["MASimple@tv-basicstudies"],
      support_host: "https://www.tradingview.com",
    });

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.height = "100%";
    wrapper.style.width = "100%";
    container.appendChild(wrapper);
    container.appendChild(script);

    return () => { container.innerHTML = ""; };
  }, [symbol, market]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}
      style={{ height: "100%", width: "100%" }} />
  );
}

export default memo(TradingViewChart);
