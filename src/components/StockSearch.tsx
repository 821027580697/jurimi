"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks, StockInfo } from "@/lib/stocks";
import { formatNumber } from "@/lib/format";
import PriceTag from "./PriceTag";
import StockChart from "./StockChart";

interface QuoteResult {
  price: number;
  change: number;
  changePercent: number;
  prevClose: number;
  high?: number;
  low?: number;
  open?: number;
  volume?: number;
  name?: string;
}

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockInfo[]>([]);
  const [selected, setSelected] = useState<StockInfo | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length >= 1) {
      setResults(searchStocks(query));
    } else {
      setResults([]);
    }
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchQuote = useCallback(async (stock: StockInfo) => {
    setLoading(true);
    setQuote(null);

    try {
      if (stock.market === "KR") {
        const res = await fetch(`/api/kis?type=price&symbol=${stock.code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.price > 0) {
            setQuote({
              price: data.price,
              change: data.change,
              changePercent: data.changePercent,
              prevClose: data.prevClose,
              high: data.high,
              low: data.low,
              open: data.open,
              volume: data.volume,
              name: data.name,
            });
          }
        }
      } else {
        const res = await fetch(`/api/finnhub?type=quote&symbol=${stock.code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.c > 0) {
            setQuote({
              price: data.c,
              change: data.d,
              changePercent: data.dp,
              prevClose: data.pc,
              high: data.h,
              low: data.l,
              open: data.o,
            });
          }
        }
      }
    } catch {}
    setLoading(false);
  }, []);

  const handleSelect = (stock: StockInfo) => {
    setSelected(stock);
    setQuery(stock.name);
    setFocused(false);
    setShowChart(true);
    fetchQuote(stock);
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setQuote(null);
    setResults([]);
    setShowChart(false);
    inputRef.current?.focus();
  };

  const fmtPrice = (v: number) => {
    if (!selected) return "";
    return selected.market === "KR"
      ? `${Math.round(v).toLocaleString("ko-KR")}원`
      : `$${formatNumber(v, 2)}`;
  };

  return (
    <section className="px-4 py-3" ref={wrapperRef}>
      {/* 검색 바 */}
      <div className="relative">
        <div className="flex items-center gap-2 bg-card border border-line rounded-xl px-3 py-2.5">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); setQuote(null); setShowChart(false); }}
            onFocus={() => setFocused(true)}
            placeholder="종목명 또는 코드 검색 (삼성전자, AAPL...)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {query && (
            <button onClick={handleClear} className="text-muted hover:text-black text-sm">
              ✕
            </button>
          )}
        </div>

        {/* 자동완성 드롭다운 */}
        {focused && results.length > 0 && !selected && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg z-40 max-h-[300px] overflow-y-auto">
            {results.map((stock) => (
              <button
                key={`${stock.market}-${stock.code}`}
                onClick={() => handleSelect(stock)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-line last:border-0"
              >
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 shrink-0">
                  {stock.market === "KR" ? "🇰🇷" : "🇺🇸"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{stock.name}</div>
                  <div className="text-[11px] text-muted">{stock.code} · {stock.sector}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 시세 + 차트 결과 */}
      {selected && (
        <div className="mt-3 bg-white border border-line rounded-2xl p-4 animate-in">
          {/* 종목 헤더 */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100">
                  {selected.market === "KR" ? "🇰🇷 KRX" : "🇺🇸 US"}
                </span>
                <span className="text-xs text-muted">{selected.sector}</span>
              </div>
              <div className="text-lg font-bold mt-1">{quote?.name || selected.name}</div>
              <div className="text-xs text-muted">{selected.code}</div>
            </div>
            <button onClick={handleClear} className="text-muted hover:text-black text-lg">✕</button>
          </div>

          {/* 시세 */}
          {loading ? (
            <div className="py-4 text-center">
              <div className="text-sm text-muted animate-pulse">실시간 시세 조회 중...</div>
            </div>
          ) : quote ? (
            <>
              <div className="flex items-end gap-3 mb-3">
                <span className="font-mono font-black text-[28px] leading-none">
                  {fmtPrice(quote.price)}
                </span>
                <PriceTag change={quote.changePercent} size="lg" />
              </div>

              {/* 시세 상세 그리드 */}
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-card rounded-lg px-2 py-1.5">
                  <span className="text-muted text-[10px]">전일종가</span>
                  <div className="font-mono font-bold text-[11px] mt-0.5">{fmtPrice(quote.prevClose)}</div>
                </div>
                <div className="bg-card rounded-lg px-2 py-1.5">
                  <span className="text-muted text-[10px]">등락</span>
                  <div
                    className="font-mono font-bold text-[11px] mt-0.5"
                    style={{ color: quote.change > 0 ? "#FF2D2D" : quote.change < 0 ? "#2D6CFF" : "#999" }}
                  >
                    {quote.change > 0 ? "+" : ""}
                    {fmtPrice(quote.change)}
                  </div>
                </div>
                {quote.open !== undefined && quote.open > 0 && (
                  <div className="bg-card rounded-lg px-2 py-1.5">
                    <span className="text-muted text-[10px]">시가</span>
                    <div className="font-mono font-bold text-[11px] mt-0.5">{fmtPrice(quote.open)}</div>
                  </div>
                )}
                {quote.high !== undefined && quote.high > 0 && (
                  <div className="bg-card rounded-lg px-2 py-1.5">
                    <span className="text-muted text-[10px]">고가</span>
                    <div className="font-mono font-bold text-[11px] mt-0.5 text-up">{fmtPrice(quote.high)}</div>
                  </div>
                )}
                {quote.low !== undefined && quote.low > 0 && (
                  <div className="bg-card rounded-lg px-2 py-1.5">
                    <span className="text-muted text-[10px]">저가</span>
                    <div className="font-mono font-bold text-[11px] mt-0.5 text-down">{fmtPrice(quote.low)}</div>
                  </div>
                )}
                {quote.volume !== undefined && quote.volume > 0 && (
                  <div className="bg-card rounded-lg px-2 py-1.5">
                    <span className="text-muted text-[10px]">거래량</span>
                    <div className="font-mono font-bold text-[11px] mt-0.5">{quote.volume.toLocaleString("ko-KR")}</div>
                  </div>
                )}
              </div>

              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] text-muted">
                  실시간 · {selected.market === "KR" ? "한국투자증권 KIS" : "Finnhub"} API
                </span>
              </div>
            </>
          ) : (
            <div className="py-4 text-center text-sm text-muted">
              시세를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.
            </div>
          )}

          {/* 차트 */}
          {showChart && (
            <StockChart
              code={selected.code}
              market={selected.market}
              name={quote?.name || selected.name}
            />
          )}
        </div>
      )}
    </section>
  );
}
