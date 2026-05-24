'use client';

import { Holding, Currency } from '@/lib/types';
import { formatPrice, getCheckScore } from '@/lib/utils';
import PriceTag from './PriceTag';

interface StockCardProps {
  holding: Holding;
  currency: Currency;
  onClick: () => void;
}

export default function StockCard({ holding, currency, onClick }: StockCardProps) {
  const chg = holding.avg > 0 ? ((holding.cur - holding.avg) / holding.avg) * 100 : 0;
  const score = holding.check ? getCheckScore(holding.check) : 0;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-3.5 border border-gray-100 hover:border-gray-300 transition-colors text-left"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {holding.sector && <span className="text-base">{holding.sector}</span>}
          <span className="text-[15px] font-bold">{holding.name}</span>
          {holding.check && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                score >= 10 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {holding.check}
            </span>
          )}
          {holding.type && (
            <span
              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                holding.type === '위험' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              {holding.type}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <span className="text-xs text-gray-500">{holding.qty}주</span>
        <div className="text-right">
          <div className="text-lg font-mono font-bold">
            {formatPrice(holding.cur, !!holding.usd, currency)}
          </div>
          <PriceTag chg={chg} size="sm" />
        </div>
      </div>
    </button>
  );
}
