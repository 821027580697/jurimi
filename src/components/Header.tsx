'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stock, Currency } from '@/lib/types';
import { stocks } from '@/lib/data';
import { formatPrice, formatChange, getCheckScore } from '@/lib/utils';
import { SearchResult, buildStockFromAPI, saveCachedStock } from '@/lib/stockCache';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  onToggleMenu: () => void;
  onSelectStock: (stock: Stock) => void;
}

export default function Header({ currency, onToggleCurrency, onToggleMenu, onSelectStock }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [localResults, setLocalResults] = useState<Stock[]>([]);
  const [apiResults, setApiResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loadingSymbol, setLoadingSymbol] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAPI = useCallback(async (q: string) => {
    if (q.length < 1) { setApiResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/finnhub?type=search&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.result) {
        const filtered = (data.result as SearchResult[])
          .filter(r => r.type === 'Common Stock' || r.type === 'ETP' || r.type === 'ETF' || r.type === 'ADR')
          .slice(0, 20);
        setApiResults(filtered);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim() === '') {
      setLocalResults([]);
      setApiResults([]);
      setShowResults(false);
      return;
    }
    const q = value.toLowerCase();
    const matched = stocks.filter(
      s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 5);
    setLocalResults(matched);
    setShowResults(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAPI(value.trim()), 400);
  }

  async function handleSelectAPIResult(result: SearchResult) {
    const localMatch = stocks.find(
      s => s.code === result.displaySymbol || s.code === result.symbol.replace('.KS', '').replace('.KQ', '')
    );
    if (localMatch) {
      onSelectStock(localMatch);
      setShowResults(false);
      setQuery('');
      return;
    }

    setLoadingSymbol(result.symbol);
    try {
      const [quoteRes, profileRes] = await Promise.all([
        fetch(`/api/finnhub?type=quote&symbol=${encodeURIComponent(result.symbol)}`),
        fetch(`/api/finnhub?type=profile&symbol=${encodeURIComponent(result.symbol)}`),
      ]);
      const quote = await quoteRes.json();
      const profile = await profileRes.json();
      const stock = buildStockFromAPI(
        result.symbol,
        result.description,
        quote?.c ? quote : null,
        profile?.name ? profile : null,
        result.type,
      );
      saveCachedStock(stock);
      onSelectStock(stock);
    } catch {
      const stock = buildStockFromAPI(result.symbol, result.description, null, null, result.type);
      saveCachedStock(stock);
      onSelectStock(stock);
    } finally {
      setLoadingSymbol(null);
      setShowResults(false);
      setQuery('');
    }
  }

  const localCodes = new Set(localResults.map(s => s.code));
  const dedupedAPI = apiResults.filter(r => {
    const code = r.displaySymbol || r.symbol.replace('.KS', '').replace('.KQ', '');
    return !localCodes.has(code);
  });

  const hasResults = localResults.length > 0 || dedupedAPI.length > 0 || searching;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <span className="bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded">주</span>
          <span className="text-base font-bold">주리미</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCurrency}
            className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-full"
          >
            {currency === 'KRW' ? '₩원화' : '$달러'}
          </button>
          <button onClick={onToggleMenu} className="text-xl p-1">☰</button>
        </div>
      </div>
      <div className="px-4 pb-2" ref={containerRef}>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            placeholder="🔍 종목·코드 검색 (AAPL, 삼성전자, 005930...)"
            className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {showResults && hasResults && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[420px] overflow-y-auto z-50">
              {localResults.length > 0 && (
                <>
                  <div className="px-3 py-1.5 bg-gray-50 text-[10px] font-bold text-gray-500 sticky top-0">
                    주리미 DB ({localResults.length})
                  </div>
                  {localResults.map(stock => {
                    const change = formatChange(stock.chg);
                    const score = getCheckScore(stock.check);
                    return (
                      <button
                        key={stock.code}
                        onClick={() => {
                          onSelectStock(stock);
                          setShowResults(false);
                          setQuery('');
                        }}
                        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100"
                      >
                        <div className="flex items-center gap-2">
                          <span>{stock.sector}</span>
                          <div className="text-left">
                            <div className="text-sm font-bold">{stock.name}</div>
                            <div className="text-xs text-gray-500">{stock.code}</div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              score >= 10 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                            }`}
                          >
                            {stock.check}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono font-bold">
                            {formatPrice(stock.price, !!stock.usd, currency)}
                          </div>
                          <div className="text-xs font-mono" style={{ color: change.color }}>
                            {change.text}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {(dedupedAPI.length > 0 || searching) && (
                <>
                  <div className="px-3 py-1.5 bg-blue-50 text-[10px] font-bold text-blue-600 sticky top-0 flex items-center justify-between">
                    <span>글로벌 검색 (Finnhub)</span>
                    {searching && <span className="animate-pulse">검색 중...</span>}
                  </div>
                  {dedupedAPI.map(result => {
                    const isLoading = loadingSymbol === result.symbol;
                    const exchange = result.symbol.includes('.KS')
                      ? 'KOSPI'
                      : result.symbol.includes('.KQ')
                      ? 'KOSDAQ'
                      : '';
                    return (
                      <button
                        key={result.symbol}
                        onClick={() => handleSelectAPIResult(result)}
                        disabled={isLoading}
                        className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-blue-50/50 border-b border-gray-100 disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2 text-left min-w-0">
                          <span className="text-base shrink-0">📈</span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{result.description}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-gray-500">{result.displaySymbol}</span>
                              <span className="text-[9px] bg-gray-200 text-gray-600 px-1 py-0.5 rounded">
                                {result.type === 'ETP' ? 'ETF' : result.type}
                              </span>
                              {exchange && (
                                <span className="text-[9px] bg-blue-100 text-blue-600 px-1 py-0.5 rounded">
                                  {exchange}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          {isLoading ? (
                            <span className="text-xs text-gray-400 animate-pulse">로딩...</span>
                          ) : (
                            <span className="text-xs text-blue-500">조회 →</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}

              {!searching && localResults.length === 0 && dedupedAPI.length === 0 && query.length > 0 && (
                <div className="px-3 py-6 text-center text-xs text-gray-400">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
