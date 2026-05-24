'use client';

import { useState } from 'react';
import { Stock, Currency } from '@/lib/types';
import { stocks } from '@/lib/data';
import { getCheckScore } from '@/lib/utils';

interface AIRecommendProps {
  currency: Currency;
  onSelectStock: (stock: Stock) => void;
}

export default function AIRecommend({ onSelectStock }: AIRecommendProps) {
  const [query, setQuery] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const ranked = [...stocks]
    .filter(s => s.aiScore !== undefined)
    .sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

  async function handleAnalyze() {
    if (!query.trim()) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockName: query }),
      });
      const data = await res.json();
      setResult(data.analysis || data.error || '분석 결과를 가져올 수 없습니다.');
    } catch {
      const stock = stocks.find(
        s => s.name.includes(query) || s.code.toLowerCase() === query.toLowerCase()
      );
      if (stock) {
        setResult(
          `📊 ${stock.name} (${stock.code}) 분석 결과\n\n` +
          `✅ 체크리스트: ${stock.check}\n` +
          `📈 PER: ${stock.per} | ROE: ${stock.roe}\n` +
          `💰 시가총액: ${stock.cap}\n` +
          `📋 투자의견: ${stock.analyst} - ${stock.op} (목표가: ${stock.tp})\n\n` +
          `${stock.desc}\n\n` +
          `🤖 AI 점수: ${stock.aiScore}/100`
        );
      } else {
        setResult('해당 종목을 찾을 수 없습니다. 정확한 종목명이나 코드를 입력해주세요.');
      }
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="px-4 mb-4">
        <h2 className="text-base font-bold mb-3">🤖 AI 종목 추천</h2>
        <p className="text-xs text-gray-500 mb-4">
          체크리스트 11항목 + ROE + PER/ROE 비율 기반 자동 순위
        </p>

        <div className="space-y-2">
          {ranked.slice(0, 10).map((stock, i) => {
            const score = getCheckScore(stock.check);
            return (
              <button
                key={stock.code}
                onClick={() => onSelectStock(stock)}
                className={`w-full rounded-xl p-3.5 text-left border transition-colors ${
                  i === 0
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-white border-gray-100 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-gray-400">#{i + 1}</span>
                    <span className="text-sm">{stock.sector}</span>
                    <span className="text-[15px] font-bold">{stock.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        score >= 10 ? 'bg-green-500 text-white' : score >= 8 ? 'bg-yellow-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {stock.check}
                    </span>
                    <span className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {stock.aiScore}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1.5">
                  PER {stock.per} + {stock.desc.split('.')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <h3 className="text-sm font-bold mb-3">💬 AI에게 물어보기</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              placeholder="종목명 입력"
              className="flex-1 px-3 py-2 bg-white rounded-lg text-sm outline-none border border-gray-200 focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 bg-black text-white text-sm font-bold rounded-lg disabled:opacity-50"
            >
              {analyzing ? '...' : '분석'}
            </button>
          </div>
          {result && (
            <div className="mt-3 p-3 bg-white rounded-lg text-xs whitespace-pre-wrap border border-gray-200">
              {result}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
