'use client';

import { useState, useRef, useEffect } from 'react';
import { Stock, Currency } from '@/lib/types';
import { stocks } from '@/lib/data';
import { formatPrice, formatChange, getCheckScore } from '@/lib/utils';

interface HeaderProps {
  currency: Currency;
  onToggleCurrency: () => void;
  onToggleMenu: () => void;
  onSelectStock: (stock: Stock) => void;
}

export default function Header({ currency, onToggleCurrency, onToggleMenu, onSelectStock }: HeaderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim() === '') {
      setResults([]);
      setShowResults(false);
      return;
    }
    const q = value.toLowerCase();
    const matched = stocks.filter(
      s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    ).slice(0, 10);
    setResults(matched);
    setShowResults(true);
  }

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
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            onFocus={() => query && setShowResults(true)}
            placeholder="🔍 종목·코드 검색"
            className="w-full px-3 py-2 bg-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {results.map(stock => {
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
                    className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-gray-50 border-b border-gray-100 last:border-0"
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
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
