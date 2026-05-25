"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchStocks, isKoreanCode, StockInfo } from "@/lib/stocks";
import StockDetailPage from "./StockDetailPage";

interface ApiSearchResult {
  name: string;
  code: string;
  market: "KR" | "US";
  type?: string;
}

export default function StockSearch() {
  const [query, setQuery] = useState("");
  const [localResults, setLocalResults] = useState<StockInfo[]>([]);
  const [apiResults, setApiResults] = useState<ApiSearchResult[]>([]);
  const [apiSearching, setApiSearching] = useState(false);
  const [selected, setSelected] = useState<StockInfo | null>(null);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length >= 1 && !selected) {
      setLocalResults(searchStocks(query));
    } else {
      setLocalResults([]);
    }
  }, [query, selected]);

  // API 검색 — 모든 쿼리에 대해 실행 (한글 포함)
  useEffect(() => {
    if (selected) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const q = query.trim();
    if (q.length < 2) { setApiResults([]); setApiSearching(false); return; }

    const isCode = isKoreanCode(q);
    const hasEng = /[a-zA-Z]/.test(q);

    // 영문이거나 6자리 코드일 때 API 검색
    if (hasEng || isCode) {
      debounceRef.current = setTimeout(async () => {
        setApiSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
          if (res.ok) {
            const data = await res.json();
            const localCodes = new Set(localResults.map((r) => r.code));
            setApiResults((data.results || []).filter((r: ApiSearchResult) => !localCodes.has(r.code)));
          }
        } catch {}
        setApiSearching(false);
      }, 400);
    } else {
      setApiResults([]);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, selected, localResults]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setFocused(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSelect = useCallback((s: StockInfo) => {
    setSelected(s);
    setQuery(s.name);
    setFocused(false);
    setApiResults([]);
  }, []);

  const handleClear = () => {
    setQuery(""); setSelected(null); setLocalResults([]); setApiResults([]);
    inputRef.current?.focus();
  };

  // 엔터키로 검색 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    // 1. 로컬 결과 첫 번째 선택
    if (localResults.length > 0) {
      handleSelect(localResults[0]);
      return;
    }
    // 2. API 결과 첫 번째 선택
    if (apiResults.length > 0) {
      handleSelect({ name: apiResults[0].name, code: apiResults[0].code, market: apiResults[0].market, sector: apiResults[0].type });
      return;
    }
    // 3. 6자리 코드 → KIS 직접 조회
    if (isKoreanCode(q)) {
      handleSelect({ name: q, code: q, market: "KR" });
      return;
    }
    // 4. 영문 → US 종목으로 직접 조회
    if (/^[A-Za-z]{1,5}$/.test(q)) {
      handleSelect({ name: q.toUpperCase(), code: q.toUpperCase(), market: "US" });
      return;
    }
  };

  const hasResults = localResults.length > 0 || apiResults.length > 0;
  const showDirect = isKoreanCode(query.trim()) && localResults.length === 0;

  if (selected) {
    return <StockDetailPage stock={selected} onBack={handleClear} />;
  }

  return (
    <section className="px-4 py-3" ref={wrapperRef}>
      <div className="relative">
        <div className="flex items-center gap-2 bg-card border border-line rounded-xl px-3 py-2.5">
          <svg className="w-4 h-4 text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input ref={inputRef} type="text" value={query}
            onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            placeholder="종목 검색 후 Enter (삼성전자, AAPL, 005930)"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />
          {apiSearching && <span className="text-[10px] text-muted animate-pulse shrink-0">검색중</span>}
          {query && <button onClick={handleClear} className="text-muted hover:text-black text-sm shrink-0">✕</button>}
        </div>

        {focused && !selected && (hasResults || showDirect || apiSearching) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-line rounded-xl shadow-lg z-40 max-h-[350px] overflow-y-auto">
            {localResults.map((s) => (
              <button key={`l-${s.market}-${s.code}`} onClick={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-line">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 shrink-0">
                  {s.market === "KR" ? "🇰🇷" : "🇺🇸"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{s.name}</div>
                  <div className="text-[11px] text-muted">{s.code} · {s.sector}</div>
                </div>
              </button>
            ))}

            {apiResults.length > 0 && (
              <>
                <div className="px-4 py-1.5 bg-gray-50 text-[10px] text-muted font-bold border-b border-line">API 검색 결과</div>
                {apiResults.map((r, i) => (
                  <button key={`a-${r.code}-${i}`}
                    onClick={() => handleSelect({ name: r.name, code: r.code, market: r.market, sector: r.type })}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b border-line">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 shrink-0">
                      {r.market === "KR" ? "🇰🇷" : "🇺🇸"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{r.name}</div>
                      <div className="text-[11px] text-muted">{r.code}{r.type ? ` · ${r.type}` : ""}</div>
                    </div>
                  </button>
                ))}
              </>
            )}

            {showDirect && (
              <button onClick={() => handleSelect({ name: query.trim(), code: query.trim(), market: "KR" })}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black text-white shrink-0">🔍</span>
                <div>
                  <div className="text-sm font-bold">{query.trim()} 직접 조회</div>
                  <div className="text-[11px] text-muted">KIS API에서 종목 정보 조회</div>
                </div>
              </button>
            )}

            {apiSearching && !hasResults && !showDirect && (
              <div className="px-4 py-3 text-center text-sm text-muted animate-pulse">전종목 검색 중...</div>
            )}
            {!apiSearching && !hasResults && !showDirect && query.length >= 2 && (
              <div className="px-4 py-3 text-center text-xs text-muted">
                결과 없음 · Enter로 직접 조회 가능
              </div>
            )}
          </div>
        )}
      </div>

      {focused && !query && (
        <div className="mt-2 text-[11px] text-muted space-y-0.5 px-1">
          <div>🇰🇷 한국: 종목명 또는 6자리 코드 → Enter</div>
          <div>🇺🇸 미국: 종목명 또는 티커 → Enter</div>
          <div>📊 ETF: KODEX, TIGER, SPY, QQQ 등</div>
        </div>
      )}
    </section>
  );
}
