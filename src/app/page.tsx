'use client';

import { useState } from 'react';
import { Tab, Currency, Stock } from '@/lib/types';
import { stocks, portfolio, marketIndices, bondsCommodities } from '@/lib/data';
import {
  formatChange,
  calculatePortfolioValue,
  calculatePL,
} from '@/lib/utils';
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

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [currency, setCurrency] = useState<Currency>('KRW');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const { bookmarks, toggle: toggleBookmark, isBookmarked } = useBookmarks();

  const allHoldings = [...portfolio.domestic, ...portfolio.overseas, ...portfolio.pension];
  const totalValue = calculatePortfolioValue(allHoldings, currency);
  const totalPL = calculatePL(allHoldings, currency);

  const domesticValue = calculatePortfolioValue(portfolio.domestic, currency);
  const domesticPL = calculatePL(portfolio.domestic, currency);
  const overseasValue = calculatePortfolioValue(portfolio.overseas, currency);
  const overseasPL = calculatePL(portfolio.overseas, currency);
  const pensionValue = calculatePortfolioValue(portfolio.pension, currency);
  const pensionPL = calculatePL(portfolio.pension, currency);

  function handleSelectStock(stock: Stock) {
    setSelectedStock(stock);
  }

  function handleBack() {
    setSelectedStock(null);
  }

  function handleStockFromHolding(code: string) {
    const stock = stocks.find(s => s.code === code);
    if (stock) setSelectedStock(stock);
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
    if (currency === 'KRW') {
      return `(${sign}${Math.round(v / 10000)}만원)`;
    }
    return `(${sign}$${Math.round(v).toLocaleString()})`;
  };

  if (selectedStock) {
    return (
      <div className="max-w-[480px] mx-auto bg-white min-h-screen">
        <Header
          currency={currency}
          onToggleCurrency={() => setCurrency(c => (c === 'KRW' ? 'USD' : 'KRW'))}
          onToggleMenu={() => setMenuOpen(true)}
          onSelectStock={handleSelectStock}
        />
        <StockDetail
          stock={selectedStock}
          currency={currency}
          onBack={handleBack}
          isBookmarked={isBookmarked(selectedStock.code)}
          onToggleBookmark={toggleBookmark}
        />
        <SideMenu
          isOpen={menuOpen}
          onClose={() => setMenuOpen(false)}
          onNavigate={tab => {
            setActiveTab(tab);
            setSelectedStock(null);
          }}
          bookmarkCount={bookmarks.length}
        />
      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto bg-white min-h-screen">
      <Header
        currency={currency}
        onToggleCurrency={() => setCurrency(c => (c === 'KRW' ? 'USD' : 'KRW'))}
        onToggleMenu={() => setMenuOpen(true)}
        onSelectStock={handleSelectStock}
      />

      <main className="pb-20">
        {activeTab === 'home' && (
          <div>
            <div className="px-4 pt-3 mb-3">
              <button
                onClick={() => setActiveTab('asset')}
                className="w-full bg-black text-white rounded-xl p-4 text-left"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-300">총 자산</span>
                  <span className="text-xs text-gray-400">→ 상세보기</span>
                </div>
                <div className="text-[28px] font-mono font-black">{formatVal(totalValue)}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-sm font-mono font-bold"
                    style={{ color: totalPL.percent >= 0 ? '#FF6B6B' : '#6BA3FF' }}
                  >
                    {totalPL.percent >= 0 ? '▲' : '▼'} {totalPL.percent >= 0 ? '+' : ''}
                    {totalPL.percent.toFixed(2)}%
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatPLAmount(totalPL.amount)}
                  </span>
                </div>
                <div className="flex gap-1.5 mt-2">
                  {[
                    { emoji: '🚀', pct: '72%' },
                    { emoji: '👓', pct: '15%' },
                    { emoji: '🤖', pct: '2%' },
                    { emoji: '💰', pct: '1%' },
                  ].map((s, i) => (
                    <span key={i} className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded">
                      {s.emoji}{s.pct}
                    </span>
                  ))}
                </div>
              </button>
            </div>

            <div className="px-4 mb-3">
              <div className="grid grid-cols-3 gap-2">
                <AccountSummary
                  flag="🇰🇷"
                  label="국내"
                  value={formatVal(domesticValue)}
                  chg={domesticPL.percent}
                />
                <AccountSummary
                  flag="🇺🇸"
                  label="해외"
                  value={formatVal(overseasValue)}
                  chg={overseasPL.percent}
                />
                <AccountSummary
                  flag="🏦"
                  label="퇴직연금"
                  value={formatVal(pensionValue)}
                  chg={pensionPL.percent}
                />
              </div>
            </div>

            <div className="px-4 mb-3">
              <h2 className="text-base font-bold mb-2">보유 종목</h2>
              <div className="space-y-2">
                {[...portfolio.domestic, ...portfolio.overseas].map(h => (
                  <StockCard
                    key={h.code}
                    holding={h}
                    currency={currency}
                    onClick={() => handleStockFromHolding(h.code)}
                  />
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
            <h2 className="text-base font-bold mb-3">📈 실시간 지수</h2>
            <div className="space-y-1 mb-4">
              {marketIndices.map((idx, i) => (
                <div key={i}>
                  {i === 2 && <div className="border-t border-gray-200 my-2" />}
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span>{idx.flag}</span>
                      <span className="text-sm font-medium">{idx.name}</span>
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
          <Bookmark
            currency={currency}
            bookmarks={bookmarks}
            onToggleBookmark={toggleBookmark}
            onSelectStock={handleSelectStock}
          />
        )}

        {activeTab === 'asset' && (
          <div className="pt-3">
            <Portfolio currency={currency} onSelectStock={handleSelectStock} />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="pt-3">
            <NewsFeed />
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="pt-3">
            <AIRecommend currency={currency} onSelectStock={handleSelectStock} />
          </div>
        )}
      </main>

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        bookmarkCount={bookmarks.length}
      />
      <SideMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onNavigate={tab => {
          setActiveTab(tab);
          setSelectedStock(null);
        }}
        bookmarkCount={bookmarks.length}
      />
    </div>
  );
}

function AccountSummary({
  flag,
  label,
  value,
  chg,
}: {
  flag: string;
  label: string;
  value: string;
  chg: number;
}) {
  const change = formatChange(chg);
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">
        {flag} {label}
      </div>
      <div className="text-sm font-mono font-bold">{value}</div>
      <div className="text-xs font-mono font-bold mt-0.5" style={{ color: change.color }}>
        {change.text}
      </div>
    </div>
  );
}
