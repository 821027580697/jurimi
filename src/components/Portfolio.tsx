'use client';

import { Stock, Currency, Holding } from '@/lib/types';
import { portfolio, stocks, EXCHANGE_RATE } from '@/lib/data';
import { calculatePortfolioValue, calculatePL, formatChange } from '@/lib/utils';
import { toFinnhubSymbol, QuoteData } from '@/lib/api';
import StockCard from './StockCard';

interface PortfolioProps {
  currency: Currency;
  onSelectStock: (stock: Stock) => void;
  liveQuotes?: Record<string, QuoteData>;
}

export default function Portfolio({ currency, onSelectStock, liveQuotes = {} }: PortfolioProps) {
  const applyLive = (holdings: Holding[]): Holding[] =>
    holdings.map(h => {
      const sym = h.usd ? h.code : toFinnhubSymbol(h.code);
      const q = liveQuotes[sym] || liveQuotes[h.code];
      if (q && q.c > 0) return { ...h, cur: q.c };
      return h;
    });

  const liveDomestic = applyLive(portfolio.domestic);
  const liveOverseas = applyLive(portfolio.overseas);
  const livePension = applyLive(portfolio.pension);
  const allHoldings = [...liveDomestic, ...liveOverseas, ...livePension];

  const hasLive = Object.keys(liveQuotes).length > 0;
  const sectorWeights = calculateSectorWeights(allHoldings);

  const domesticValue = calculatePortfolioValue(liveDomestic, currency);
  const domesticPL = calculatePL(liveDomestic, currency);
  const overseasValue = calculatePortfolioValue(liveOverseas, currency);
  const overseasPL = calculatePL(liveOverseas, currency);
  const pensionValue = calculatePortfolioValue(livePension, currency);
  const pensionPL = calculatePL(livePension, currency);

  function handleStockClick(holding: Holding) {
    const stock = stocks.find(s => s.code === holding.code);
    if (stock) {
      const sym = stock.usd ? stock.code : toFinnhubSymbol(stock.code);
      const q = liveQuotes[sym] || liveQuotes[stock.code];
      if (q && q.c > 0) onSelectStock({ ...stock, price: q.c, chg: q.dp });
      else onSelectStock(stock);
    }
  }

  const formatVal = (v: number) => {
    if (currency === 'KRW') return `${Math.round(v / 10000)}만원`;
    return `$${Math.round(v).toLocaleString()}`;
  };

  return (
    <div className="pb-20">
      <div className="px-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-bold">섹터별 비중</h2>
          {hasLive && <span className="text-[9px] bg-green-500 text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>}
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="flex h-6 rounded-full overflow-hidden">
            {sectorWeights.map((sw, i) => (
              <div key={i} style={{ width: `${sw.weight}%`, backgroundColor: ['#1a1a1a', '#444', '#777', '#aaa', '#ddd'][i % 5] }}
                className="flex items-center justify-center">
                {sw.weight > 10 && <span className="text-[9px] text-white font-bold">{sw.sector}</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {sectorWeights.map((sw, i) => (
              <span key={i} className="text-[10px] text-gray-600">{sw.sector} {sw.weight.toFixed(0)}%</span>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <AccountSection title="🇰🇷 메리츠 국내" value={formatVal(domesticValue)} pl={domesticPL}
          holdings={liveDomestic} currency={currency} onSelect={handleStockClick} />
        <AccountSection title="🇺🇸 메리츠 해외" value={formatVal(overseasValue)} pl={overseasPL}
          holdings={liveOverseas} currency={currency} onSelect={handleStockClick} showLive={hasLive} />
        <AccountSection title="🏦 NH 퇴직연금 DC" value={formatVal(pensionValue)} pl={pensionPL}
          holdings={livePension} currency={currency} onSelect={handleStockClick} />
      </div>
    </div>
  );
}

function AccountSection({ title, value, pl, holdings, currency, onSelect, showLive }: {
  title: string; value: string; pl: { percent: number }; holdings: Holding[];
  currency: Currency; onSelect: (h: Holding) => void; showLive?: boolean;
}) {
  const chgFormatted = formatChange(pl.percent);
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold">{title}</h3>
          {showLive && <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono font-bold">{value}</span>
          <span className="text-xs font-mono font-bold" style={{ color: chgFormatted.color }}>{chgFormatted.text}</span>
        </div>
      </div>
      <div className="space-y-2">
        {holdings.map(h => <StockCard key={h.code + h.name} holding={h} currency={currency} onClick={() => onSelect(h)} />)}
      </div>
    </div>
  );
}

function calculateSectorWeights(holdings: Holding[]): { sector: string; weight: number }[] {
  const sectorMap: Record<string, number> = {};
  let total = 0;
  for (const h of holdings) {
    const value = h.qty * h.cur * (h.usd ? EXCHANGE_RATE : 1);
    const sector = h.sector || (h.type === '안전' ? '💰' : '📊');
    sectorMap[sector] = (sectorMap[sector] || 0) + value;
    total += value;
  }
  return Object.entries(sectorMap)
    .map(([sector, value]) => ({ sector, weight: (value / total) * 100 }))
    .sort((a, b) => b.weight - a.weight);
}
