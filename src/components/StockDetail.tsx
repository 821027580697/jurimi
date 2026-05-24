'use client';

import { Stock, Currency } from '@/lib/types';
import { formatPrice, formatChange, getCheckScore } from '@/lib/utils';
import Chart from './Chart';

interface StockDetailProps {
  stock: Stock;
  currency: Currency;
  onBack: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (code: string) => void;
}

export default function StockDetail({
  stock,
  currency,
  onBack,
  isBookmarked,
  onToggleBookmark,
}: StockDetailProps) {
  const change = formatChange(stock.chg);
  const score = getCheckScore(stock.check);
  const total = 11;
  const isPass = score >= 10;

  const indicators = [
    { name: 'RSI', value: (45 + Math.random() * 30).toFixed(1), label: parseFloat((45 + Math.random() * 30).toFixed(1)) > 70 ? '과매수' : parseFloat((45 + Math.random() * 30).toFixed(1)) < 30 ? '과매도' : '정상' },
    { name: '%b', value: (0.3 + Math.random() * 0.5).toFixed(2), label: '중간' },
    { name: 'MFI', value: (50 + Math.random() * 30).toFixed(1), label: parseFloat((50 + Math.random() * 30).toFixed(1)) > 70 ? '과유입' : '유입' },
    { name: 'MACD', value: Math.random() > 0.5 ? '골든' : '데드', label: Math.random() > 0.5 ? '매수' : '매도' },
  ];

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onBack} className="text-sm text-gray-600">
          ← 돌아가기
        </button>
        <button
          onClick={() => onToggleBookmark(stock.code)}
          className={`text-sm font-bold px-3 py-1.5 rounded-full transition-colors ${
            isBookmarked
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isBookmarked ? '📌 북마크됨' : '📌 북마크'}
        </button>
      </div>

      <div className="px-4 mb-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{stock.sector}</span>
              <span className="text-[15px] font-bold">{stock.name}</span>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">{stock.code}</div>
            <div className="text-xs text-gray-400 mt-1 max-w-[250px]">{stock.desc}</div>
          </div>
          <div className="text-right">
            <div className="text-[28px] font-mono font-black">
              {formatPrice(stock.price, !!stock.usd, currency)}
            </div>
            <div className="font-mono font-bold text-base" style={{ color: change.color }}>
              {change.text}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-6">
        <Chart symbol={stock.code} isKorean={!stock.usd} />
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold mb-2">보조지표</h3>
        <div className="grid grid-cols-4 gap-2">
          {indicators.map(ind => (
            <div key={ind.name} className="bg-gray-50 rounded-lg p-2.5 text-center">
              <div className="text-[10px] text-gray-500 font-bold">{ind.name}</div>
              <div className="text-sm font-mono font-bold mt-0.5">{ind.value}</div>
              <div className="text-[10px] text-gray-500">{ind.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold mb-2">재무 정보</h3>
        <div className="grid grid-cols-3 gap-2">
          <FinancialCell label="PER" value={stock.per} negative={stock.per === '적자'} />
          <FinancialCell label="ROE" value={stock.roe} negative={stock.roe === '음수'} />
          <FinancialCell label="매출성장" value={stock.rev} negative={stock.rev.startsWith('-')} />
          <FinancialCell label="시가총액" value={stock.cap} />
          <FinancialCell label="목표가" value={stock.tp} />
          <FinancialCell
            label="투자의견"
            value={stock.op}
            positive={stock.op === '적극매수' || stock.op === '매수'}
          />
        </div>
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold mb-2">증권사 의견</h3>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{stock.analyst}</span>
            <span className="text-xs font-bold">목표가 {stock.tp}</span>
          </div>
          <div className="mt-1">
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                color: stock.op === '적극매수' || stock.op === '매수' ? '#FF2D2D' : '#555',
                backgroundColor: stock.op === '적극매수' || stock.op === '매수' ? '#FFE5E5' : '#f0f0f0',
              }}
            >
              {stock.op}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 mb-4">
        <h3 className="text-sm font-bold mb-2">관련 뉴스</h3>
        <div className="space-y-2">
          {stock.news.map((n, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3">
              <span className="text-xs">{n}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <div
          className={`rounded-xl p-6 text-center ${
            isPass ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'
          }`}
        >
          <div className="text-[40px] font-black font-mono">
            {score}/{total}
          </div>
          <div className={`text-lg font-bold mt-1 ${isPass ? 'text-green-600' : 'text-red-600'}`}>
            {isPass ? '투자 적격 ✅' : '미통과 ❌'}
          </div>
        </div>
      </div>
    </div>
  );
}

function FinancialCell({
  label,
  value,
  negative,
  positive,
}: {
  label: string;
  value: string;
  negative?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 text-center">
      <div className="text-[10px] text-gray-500">{label}</div>
      <div
        className="text-sm font-bold mt-0.5"
        style={{
          color: negative ? '#2D6CFF' : positive ? '#FF2D2D' : '#000',
        }}
      >
        {value}
      </div>
    </div>
  );
}
