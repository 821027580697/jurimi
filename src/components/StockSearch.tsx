"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks, isKoreanCode, StockInfo } from "@/lib/stocks";
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

interface ApiSearchResult {
  name: string;
  code: string;
  market: "KR" | "US";
  type?: string;
  price?: number;
  changePercent?: number;
}

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<StockInfo[]>([]);
  const [apiResults, setApiResults] = useState<ApiSearchResult[]>([]);
  const [apiSearching, setApiSearching] = useState(false);
  const [selected, setSelected] = useState<StockInfo | null>(null);
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 로컬 DB 즉시 검색
  useEffect(() => {
    if (query.length >= 1 && !selected) {
      setLocalResults(searchStocks(query));
    } else {
      setLocalResults([]);
    }
  }, [query, selected]);

  // API 검색 (디바운스 500ms)
  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setApiResults([]);
      setApiSearching(false);
      return;
    }

    // 한글만 입력 + 로컬에 결과 있으면 API 스킵
    const hasEnglish = /[a-zA-Z]/.test(q);
    const isCode = isKoreanCode(q);

    if (!hasEnglish && !isCode && localResults.length > 0) {
      setApiResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setApiSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          // 로컬 결과와 중복 제거
          const localCodes = new Set(localResults.map((r) => r.code));
          const filtered = (data.results || []).filter(
            (r: ApiSearchResult) => !localCodes.has(r.code)
          );
          setApiResults(filtered);
        }
      } catch {}
      setApiSearching(false);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selected, localResults]);

  // 외부 클릭 시 드롭다운 닫기
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
              price: data.price, change: data.change, changePercent: data.changePercent,
              prevClose: data.prevClose, high: data.high, low: data.low,
              open: data.open, volume: data.volume, name: data.name,
            });
          }
        }
      } else {
        const res = await fetch(`/api/finnhub?type=quote&symbol=${stock.code}`);
        if (res.ok) {
          const data = await res.json();
          if (data.c > 0) {
            setQuote({
              price: data.c, change: data.d, changePercent: data.dp,
              prevClose: data.pc, high: data.h, low: data.l, open: data.o,
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
    setApiResults([]);
    fetchQuote(stock);
  };

  const handleSelectApi = (result: ApiSearchResult) => {
    const stock: StockInfo = {
      name: result.name,
      code: result.code,
      market: result.market,
      sector: result.type || "",
    };
    handleSelect(stock);
  };

  // 6자리 코드 직접 조회
  const handleDirectLookup = () => {
    const code = query.trim();
    if (!isKoreanCode(code)) return;
    const stock: StockInfo = { name: code, code, market: "KR", sector: "" };
    handleSelect(stock);
  };

  const handleClear = () => {
    setQuery("");
    setSelected(null);
    setQuote(null);
    setLocalResults([]);
    setApiResults([]);
    setShowChart(false);
    inputRef.current?.focus();
  };

  const fmtPrice = (v: number) => {
    if (!selected) return "";
    return selected.market === "KR"
      ? `${Math.round(v).toLocaleString("ko-KR")}원`
      : `$${formatNumber(v, 2)}`;
  };

  const hasResults = localResults.length > 0 || apiResults.length > 0;
  const showDirectLookup = isKoreanCode(query.trim()) && localResults.length === 0;

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
            placeholder="종목명, 코드, 티커 검색 (삼성전자, 005930, AAPL)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {apiSearching && (
            <span className="text-[10px] text-muted animate-pulse shrink-0">검색중</span>
          )}
          {query && (
            <button onClick={handleClear} className="text-muted hover:text-black text-sm shrink-0">✕</button>
          )}
        </div>

        {/* 검색 결과 드롭다운 */}
        {focused && !selected && (hasResults || showDirectLookup || apiSearching) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg z-40 max-h-[350px] overflow-y-auto">

            {/* 로컬 DB 결과 */}
            {localResults.length > 0 && (
              <>
                {localResults.map((stock) => (
                  <button
                    key={`local-${stock.market}-${stock.code}`}
                    onClick={() => handleSelect(stock)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-line"
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
              </>
            )}

            {/* API 검색 결과 (Finnhub / KIS) */}
            {apiResults.length > 0 && (
              <>
                <div className="px-4 py-1.5 bg-gray-50 text-[10px] text-muted font-bold border-b border-line">
                  API 검색 결과
                </div>
                {apiResults.map((r, i) => (
                  <button
                    key={`api-${r.market}-${r.code}-${i}`}
                    onClick={() => handleSelectApi(r)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-line"
                  >
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
                      {r.market === "KR" ? "🇰🇷" : "🇺🇸"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{r.name}</div>
                      <div className="text-[11px] text-muted">
                        {r.code}
                        {r.type && ` · ${r.type}`}
                        {r.price && r.price > 0 && (
                          <span className="ml-1 font-mono">{r.market === "KR" ? `${r.price.toLocaleString()}원` : ""}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* 6자리 코드 직접 조회 */}
            {showDirectLookup && (
              <button
                onClick={handleDirectLookup}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left border-b border-line"
              >
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black text-white shrink-0">
                  🔍
                </span>
                <div>
                  <div className="text-sm font-bold">{query.trim()} 코드로 직접 조회</div>
                  <div className="text-[11px] text-muted">KIS API에서 종목 정보를 가져옵니다</div>
                </div>
              </button>
            )}

            {/* 검색중 표시 */}
            {apiSearching && apiResults.length === 0 && localResults.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-muted animate-pulse">
                전종목 검색 중...
              </div>
            )}

            {/* 검색 결과 없음 */}
            {!apiSearching && !hasResults && !showDirectLookup && query.length >= 2 && (
              <div className="px-4 py-3 text-center text-xs text-muted">
                결과 없음 · 한국 종목은 6자리 코드로 직접 조회 가능
              </div>
            )}
          </div>
        )}
      </div>

      {/* 검색 가이드 (포커스 시, 입력 전) */}
      {focused && !query && !selected && (
        <div className="mt-2 text-[11px] text-muted space-y-0.5 px-1">
          <div>🇰🇷 한국: 종목명 또는 6자리 코드 (삼성전자, 005930)</div>
          <div>🇺🇸 미국: 종목명 또는 티커 (apple, NVDA, tesla)</div>
          <div>📊 ETF: KODEX, TIGER, SPY, QQQ 등</div>
        </div>
      )}

      {/* 시세 + 차트 결과 카드 */}
      {selected && (
        <div className="mt-3 bg-white border border-line rounded-2xl p-4 animate-in">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100">
                  {selected.market === "KR" ? "🇰🇷 KRX" : "🇺🇸 US"}
                </span>
                {selected.sector && <span className="text-xs text-muted">{selected.sector}</span>}
              </div>
              <div className="text-lg font-bold mt-1">{quote?.name || selected.name}</div>
              <div className="text-xs text-muted">{selected.code}</div>
            </div>
            <button onClick={handleClear} className="text-muted hover:text-black text-lg">✕</button>
          </div>

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

              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <div className="bg-card rounded-lg px-2 py-1.5">
                  <span className="text-muted text-[10px]">전일종가</span>
                  <div className="font-mono font-bold text-[11px] mt-0.5">{fmtPrice(quote.prevClose)}</div>
                </div>
                <div className="bg-card rounded-lg px-2 py-1.5">
                  <span className="text-muted text-[10px]">등락</span>
                  <div className="font-mono font-bold text-[11px] mt-0.5"
                    style={{ color: quote.change > 0 ? "#FF2D2D" : quote.change < 0 ? "#2D6CFF" : "#999" }}>
                    {quote.change > 0 ? "+" : ""}{fmtPrice(quote.change)}
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

          {showChart && (
            <StockChart code={selected.code} market={selected.market} name={quote?.name || selected.name} />
          )}
        </div>
      )}
    </section>
  );
}
