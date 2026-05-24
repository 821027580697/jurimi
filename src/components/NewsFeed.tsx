'use client';

import { useState, useEffect } from 'react';
import { newsItems as staticNews } from '@/lib/data';
import { fetchGeneralNews, FinnhubNewsItem } from '@/lib/api';
import MoneyFlow from './MoneyFlow';

type Filter = 'all' | 'flow' | 'latest' | 'macro';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'flow', label: '💰돈흐름' },
  { key: 'latest', label: '📰최신뉴스' },
];

export default function NewsFeed() {
  const [filter, setFilter] = useState<Filter>('all');
  const [liveNews, setLiveNews] = useState<FinnhubNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    fetchGeneralNews().then(news => {
      if (news.length > 0) {
        setLiveNews(news.slice(0, 30));
        setIsLive(true);
      }
      setLoading(false);
    });
  }, []);

  const filteredLive = filter === 'flow' ? [] : liveNews;

  return (
    <div className="pb-20">
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold ${filter === f.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {(filter === 'all' || filter === 'flow') && (
        <div className="px-4 mb-4">
          <MoneyFlow />
        </div>
      )}

      {loading && (
        <div className="px-4 py-8 text-center text-sm text-gray-400 animate-pulse">
          뉴스 로딩 중...
        </div>
      )}

      {isLive && filteredLive.length > 0 && filter !== 'flow' && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold">실시간 글로벌 뉴스</h3>
            <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
          </div>
          <div className="space-y-2">
            {filteredLive.map(news => (
              <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl p-3 border border-gray-100 hover:border-gray-300 transition-colors bg-white">
                {news.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={news.image} alt="" className="w-full h-32 object-cover rounded-lg mb-2"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="text-sm font-bold leading-snug mb-1.5">{news.headline}</div>
                {news.summary && (
                  <div className="text-xs text-gray-500 line-clamp-2 mb-1.5">{news.summary}</div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="font-medium">{news.source}</span>
                  <span>{formatTimeAgo(news.datetime)}</span>
                  {news.related && (
                    <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">{news.related}</span>
                  )}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {(!isLive || filter === 'flow') && !loading && (
        <div className="px-4 space-y-2">
          {filter !== 'latest' && staticNews.map((news, i) => {
            const badge = BADGE[news.type];
            return (
              <div key={i} className={`rounded-xl p-3 border ${COLORS[news.type]}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-bold ${badge.color}`}>{badge.text}</span>
                  <span className="text-[10px] text-gray-400">{news.time}</span>
                </div>
                <div className="text-sm font-bold">{news.title}</div>
                <div className="flex gap-1.5 mt-2">
                  {news.tags.map((tag, j) => (
                    <span key={j} className="text-[10px] bg-white/80 text-gray-600 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(timestamp * 1000).toLocaleDateString('ko-KR');
}

const COLORS: Record<string, string> = {
  surge: 'bg-red-50 border-red-200',
  good: 'bg-green-50 border-green-200',
  ipo: 'bg-purple-50 border-purple-200',
  flow: 'bg-blue-50 border-blue-200',
  macro: 'bg-gray-50 border-gray-200',
};

const BADGE: Record<string, { text: string; color: string }> = {
  surge: { text: '🔴급등', color: 'text-red-600' },
  good: { text: '🟢호재', color: 'text-green-600' },
  ipo: { text: '🟣IPO', color: 'text-purple-600' },
  flow: { text: '🔵돈흐름', color: 'text-blue-600' },
  macro: { text: '⚪매크로', color: 'text-gray-600' },
};
