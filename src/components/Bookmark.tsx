'use client';

import { useState, useMemo } from 'react';
import { Stock, Currency, SECTOR_LIST } from '@/lib/types';
import { formatPrice, formatChange, getCheckScore } from '@/lib/utils';

interface BookmarkProps {
  currency: Currency;
  bookmarkedStocks: Stock[];
  onToggleBookmark: (code: string) => void;
  onSelectStock: (stock: Stock) => void;
}

export default function Bookmark({
  currency,
  bookmarkedStocks,
  onToggleBookmark,
  onSelectStock,
}: BookmarkProps) {
  const [activeSector, setActiveSector] = useState<string>('all');

  const sectors = useMemo(() => {
    const set = new Set(bookmarkedStocks.map(s => s.sector));
    return SECTOR_LIST.filter(s => set.has(s.emoji));
  }, [bookmarkedStocks]);

  const unknownSectors = useMemo(() => {
    const known = new Set(SECTOR_LIST.map(s => s.emoji));
    const unknown = new Set<string>();
    for (const s of bookmarkedStocks) {
      if (!known.has(s.sector)) unknown.add(s.sector);
    }
    return Array.from(unknown);
  }, [bookmarkedStocks]);

  const filtered =
    activeSector === 'all'
      ? bookmarkedStocks
      : bookmarkedStocks.filter(s => s.sector === activeSector);

  const sectorCounts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of bookmarkedStocks) {
      map[s.sector] = (map[s.sector] || 0) + 1;
    }
    return map;
  }, [bookmarkedStocks]);

  if (bookmarkedStocks.length === 0) {
    return (
      <div className="pb-20 px-4 pt-4">
        <h2 className="text-base font-bold mb-3">북마크</h2>
        <div className="text-center py-16">
          <div className="text-4xl mb-3">📌</div>
          <div className="text-sm text-gray-500 mb-1">북마크한 종목이 없습니다</div>
          <div className="text-xs text-gray-400 leading-relaxed">
            검색에서 아무 종목이나 찾아서<br/>
            종목 상세의 북마크 버튼을 눌러 추가하세요
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="px-4 pt-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">
            📌 북마크 <span className="text-sm font-normal text-gray-400">{bookmarkedStocks.length}종목</span>
          </h2>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
          <button
            onClick={() => setActiveSector('all')}
            className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
              activeSector === 'all'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            전체 ({bookmarkedStocks.length})
          </button>
          {sectors.map(sec => (
            <button
              key={sec.emoji}
              onClick={() => setActiveSector(sec.emoji)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
                activeSector === sec.emoji
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {sec.emoji} {sec.name} ({sectorCounts[sec.emoji] || 0})
            </button>
          ))}
          {unknownSectors.map(emoji => (
            <button
              key={emoji}
              onClick={() => setActiveSector(emoji)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${
                activeSector === emoji
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {emoji} 기타 ({sectorCounts[emoji] || 0})
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 space-y-2">
        {filtered.map(stock => {
          const change = formatChange(stock.chg);
          const score = getCheckScore(stock.check);
          const hasCheck = stock.check !== '-/-';
          return (
            <div
              key={stock.code}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => onSelectStock(stock)}
                className="w-full p-3.5 text-left"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{stock.sector}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-bold truncate">{stock.name}</span>
                        {hasCheck && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                              score >= 10
                                ? 'bg-green-500 text-white'
                                : score >= 8
                                ? 'bg-yellow-500 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {stock.check}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{stock.code}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    {stock.price > 0 ? (
                      <>
                        <div className="text-base font-mono font-bold">
                          {formatPrice(stock.price, !!stock.usd, currency)}
                        </div>
                        <div
                          className="text-xs font-mono font-bold"
                          style={{ color: change.color }}
                        >
                          {change.text}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">가격 없음</span>
                    )}
                  </div>
                </div>
              </button>
              <div className="px-3.5 pb-2.5 flex items-center justify-between">
                <div className="flex gap-2 text-[10px] text-gray-400">
                  {stock.per !== '-' && <span>PER {stock.per}</span>}
                  {stock.roe !== '-' && <span>ROE {stock.roe}</span>}
                  {stock.cap !== '-' && <span>{stock.cap}</span>}
                  {stock.desc && stock.per === '-' && (
                    <span className="truncate max-w-[180px]">{stock.desc}</span>
                  )}
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleBookmark(stock.code);
                  }}
                  className="text-xs text-red-400 font-bold px-2 py-1 hover:bg-red-50 rounded shrink-0"
                >
                  삭제
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
