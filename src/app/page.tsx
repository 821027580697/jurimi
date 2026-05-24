'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tab, Currency, Stock } from '@/lib/types';
import { stocks, portfolio, marketIndices, bondsCommodities } from '@/lib/data';
import { formatChange, calculatePortfolioValue, calculatePL } from '@/lib/utils';
import { fetchQuotes, toFinnhubSymbol, QuoteData } from '@/lib/api';
import { useBookmarks } from '@/lib/useBookmarks';
import Header from '@/components/Header';
import TabBar from '@/components/TabBar';
import SideMenu from '@/components/SideMenu';
import StockCard from '@/components/StockCard';
import StockDetail from '@/components/StockDetail';
import Portfolio from '@/components/Portfolio';
import NewsFeed from '@/components/NewsFeed';
import AIRecommend from '@/components/AIRecommend';
import Bookmark from '@/components/Bookmark';
import EventCalendar from '@/components/EventCalendar';
import PriceTag from '@/components/PriceTag';

const MARKET_SYMBOLS: Record<string, string> = {
  'SPY': 'S&P500',
  'QQQ': '나스닥100',
  'DIA': '다우존스',
};

const POLL_INTERVAL = 60_000;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const { bookmarks, toggle: toggleBookmark, isBookmarked, getBookmarkedStocks } = useBookmarks();

  const [liveQuotes, setLiveQuotes] = useState<Record<string, QuoteData>>({});
  const [marketQuotes, setMarketQuotes] = useState<Record<string, QuoteData>>({});
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchLiveData = useCallback(async () => {
    const holdingSymbols = [
      ...portfolio.domestic.map(h => toFinnhubSymbol(h.code)),
      ...portfolio.overseas.map(h => h.code),
      ...portfolio.pension.filter(h => /^\d{6}$/.test(h.code)).map(h => toFinnhubSymbol(h.code)),
    ];
    const allSymbols = Array.from(new Set([...holdingSymbols, ...Object.keys(MARKET_SYMBOLS)]));
    const quotes = await fetchQuotes(allSymbols);
    if (Object.keys(quotes).length > 0) {
      setLiveQuotes(prev => ({ ...prev, ...quotes }));
      const mq: Record<string, QuoteData> = {};
      for (const sym of Object.keys(MARKET_SYMBOLS)) {
        if (quotes[sym]) mq[sym] = quotes[sym];
      }
      setMarketQuotes(prev => ({ ...prev, ...mq }));
      setLastUpdate(new Date());
    }
  }, []);

  useEffect(() => {
    fetchLiveData();
    const id = setInterval(fetchLiveData, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchLiveData]);

  const getLiveHoldings = useCallback(() => {
    const applyLive = (holdings: typeof portfolio.domestic) =>
      holdings.map(h => {
        const sym = h.usd ? h.code : toFinnhubSymbol(h.code);
        const q = liveQuotes[sym] || liveQuotes[h.code];
        if (q && q.c > 0) return { ...h, cur: q.c };
        return h;
      });
    return {
      domestic: applyLive(portfolio.domestic),
      overseas: applyLive(portfolio.overseas),
      pension: applyLive(portfolio.pension),
    };
  }, [liveQuotes]);

  const live = getLiveHoldings();
  const allHoldings = [...live.domestic, ...live.overseas, ...live.pension];
  const totalValue = calculatePortfolioValue(allHoldings, currency);
  const totalPL = calculatePL(allHoldings, currency);
  const domesticValue = calculatePortfolioValue(live.domestic, currency);
  const domesticPL = calculatePL(live.domestic, currency);
  const overseasValue = calculatePortfolioValue(live.overseas, currency);
  const overseasPL = calculatePL(live.overseas, currency);
  const pensionValue = calculatePortfolioValue(live.pension, currency);
  const pensionPL = calculatePL(live.pension, currency);

  const liveIndices = marketIndices.map(idx => {
    const sym = Object.entries(MARKET_SYMBOLS).find(([, name]) => name === idx.name)?.[0];
    const q = sym ? marketQuotes[sym] : null;
    if (q && q.c > 0) return { ...idx, value: q.c, chg: q.dp, live: true };
    return { ...idx, live: false };
  });

  function handleSelectStock(stock: Stock) { setSelectedStock(stock); }
  function handleBack() { setSelectedStock(null); }
  function handleStockFromHolding(code: string) {
    const stock = stocks.find(s => s.code === code);
    if (stock) {
      const sym = stock.usd ? stock.code : toFinnhubSymbol(stock.code);
      const q = liveQuotes[sym] || liveQuotes[stock.code];
      if (q && q.c > 0) {
        setSelectedStock({ ...stock, price: q.c, chg: q.dp });
      } else {
        setSelectedStock(stock);
      }
    }
  }

  const formatVal = (v: number) => {
    if (currency === 'KRW') {
      if (v >= 1_0000_0000) return `${(v / 1_0000_0000).toFixed(1)}억원`;
      return `${Math.round(v / 10000)}만원`;
    }
    return `$${Math.round(v).toLocaleString()}`;
  };
  const formatPLAmount = (v: number) => {
    const sign = v >= 0 ? '+' : '';
    if (currency === 'KRW') return `(${sign}${Math.round(v / 10000)}만원)`;
    return `(${sign}$${Math.round(v).toLocaleString()})`;
  };

  if (selectedStock) {
    return (
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        <Header currency={currency} onToggleCurrency={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')}
          onToggleMenu={() => setMenuOpen(true)} onSelectStock={handleSelectStock} />
        <StockDetail stock={selectedStock} currency={currency} onBack={handleBack}
          isBookmarked={isBookmarked(selectedStock.code)} onToggleBookmark={toggleBookmark} />
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}
          onNavigate={tab => { setActiveTab(tab); setSelectedStock(null); }} bookmarkCount={bookmarks.length} />
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen">
      <Header currency={currency} onToggleCurrency={() => setCurrency(c => c === 'KRW' ? 'USD' : 'KRW')}
        onToggleMenu={() => setMenuOpen(true)} onSelectStock={handleSelectStock} />

      <main className="pb-20">
        {activeTab === 'home' && (
          <div>
            <div className="px-4 pt-3 mb-3">
              <button onClick={() => setActiveTab('asset')} className="w-full bg-black text-white rounded-xl p-4 text-left">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-300">총 자산</span>
                    {lastUpdate && <span className="text-[9px] bg-green-500 text-white px-1 py-0.5 rounded animate-pulse">LIVE</span>}
                  </div>
                  <span className="text-xs text-gray-400">→ 상세보기</span>
                </div>
                <div className="text-[28px] font-mono font-black">{formatVal(totalValue)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono font-bold"
                    style={{ color: totalPL.percent >= 0 ? '#FF6B6B' : '#6BA3FF' }}>
                    {totalPL.percent >= 0 ? '▲' : '▼'} {totalPL.percent >= 0 ? '+' : ''}{totalPL.percent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-400">{formatPLAmount(totalPL.amount)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-1.5">
                    {[{ emoji: '🚀', pct: '72%' }, { emoji: '👓', pct: '15%' }, { emoji: '🤖', pct: '2%' }, { emoji: '💰', pct: '1%' }].map((s, i) => (
                      <span key={i} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">{s.emoji}{s.pct}</span>
                    ))}
                  </div>
                  {lastUpdate && (
                    <span className="text-[9px] text-gray-500">
                      {lastUpdate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 갱신
                    </span>
                  )}
                </div>
              </button>
            </div>

            <div className="px-4 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <AccountSummary flag="🇰🇷" label="국내" value={formatVal(domesticValue)} chg={domesticPL.percent} />
                <AccountSummary flag="🇺🇸" label="해외" value={formatVal(overseasValue)} chg={overseasPL.percent} />
                <AccountSummary flag="🏦" label="퇴직연금" value={formatVal(pensionValue)} chg={pensionPL.percent} />
              </div>
            </div>

            <div className="px-4 mb-3">
              <h2 className="text-base font-bold mb-2">보유 종목</h2>
              <div className="space-y-2">
                {[...live.domestic, ...live.overseas].map(h => (
                  <StockCard key={h.code} holding={h} currency={currency} onClick={() => handleStockFromHolding(h.code)} />
                ))}
              </div>
            </div>

            <div className="px-4 mb-3">
              <div className="bg-black text-white rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">🚀 SpaceX IPO</span>
                  <span className="text-[10px] text-gray-400">우주테크 987주</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black font-mono">D-21</span>
                  <span className="text-xs text-gray-400">6.12 · $1.75조</span>
                </div>
              </div>
            </div>

            <div className="px-4 mb-3">
              <h2 className="text-base font-bold mb-2">이벤트 D-Day</h2>
              <EventCalendar max={3} />
            </div>
          </div>
        )}

        {activeTab === 'market' && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold">📈 실시간 지수</h2>
              {lastUpdate && (
                <span className="text-[9px] text-gray-400">
                  {lastUpdate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })} 갱신
                </span>
              )}
            </div>
            <div className="space-y-1 mb-4">
              {liveIndices.map((idx, i) => (
                <div key={i}>
                  {i === 2 && <div className="border-t border-gray-200 my-2" />}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span>{idx.flag}</span>
                      <span className="text-sm font-medium">{idx.name}</span>
                      {(idx as { live?: boolean }).live && (
                        <span className="text-[8px] bg-green-500 text-white px-1 py-0.5 rounded">LIVE</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold">
                        {idx.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <PriceTag chg={idx.chg} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h2 className="text-base font-bold mb-3">채권·원자재·환율</h2>
            <div className="space-y-1">
              {bondsCommodities.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono font-bold">
                      {item.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <PriceTag chg={item.chg} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookmark' && (
          <Bookmark currency={currency} bookmarkedStocks={getBookmarkedStocks()}
            onToggleBookmark={toggleBookmark} onSelectStock={handleSelectStock} />
        )}

        {activeTab === 'asset' && (
          <div className="pt-3">
            <Portfolio currency={currency} onSelectStock={handleSelectStock} liveQuotes={liveQuotes} />
          </div>
        )}

        {activeTab === 'news' && <div className="pt-3"><NewsFeed /></div>}
        {activeTab === 'ai' && <div className="pt-3"><AIRecommend currency={currency} onSelectStock={handleSelectStock} /></div>}
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} bookmarkCount={bookmarks.length} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}
        onNavigate={tab => { setActiveTab(tab); setSelectedStock(null); }} bookmarkCount={bookmarks.length} />
    </div>
  );
}

function AccountSummary({ flag, label, value, chg }: { flag: string; label: string; value: string; chg: number }) {
  const change = formatChange(chg);
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{flag} {label}</div>
      <div className="text-sm font-mono font-bold">{value}</div>
      <div className="text-xs font-mono font-bold mt-0.5" style={{ color: change.color }}>{change.text}</div>
    </div>
  );
}
