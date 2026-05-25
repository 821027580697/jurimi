'use client';

import { useState, useEffect } from 'react';
import { fetchNaverNews, fetchGeneralNews, NaverNewsItem, FinnhubNewsItem } from '@/lib/api';
import MoneyFlow from './MoneyFlow';

type Filter = 'all' | 'flow' | 'korea' | 'global';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'flow', label: '💰돈흐름' },
  { key: 'korea', label: '🇰🇷한국뉴스' },
  { key: 'global', label: '🌍글로벌' },
];

const NAVER_QUERIES = [
  '주식시장 코스피',
  '증시 반도체',
  '주식 AI 테마',
];

export default function NewsFeed() {
  const [filter, setFilter] = useState<Filter>('all');
  const [naverNews, setNaverNews] = useState<NaverNewsItem[]>([]);
  const [globalNews, setGlobalNews] = useState<FinnhubNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      setLoading(true);
      const [naver, finnhub] = await Promise.all([
        Promise.all(NAVER_QUERIES.map(q => fetchNaverNews(q, 8))),
        fetchGeneralNews(),
      ]);

      const allNaver = naver.flat();
      const seen = new Set<string>();
      const deduped = allNaver.filter(n => {
        if (seen.has(n.title)) return false;
        seen.add(n.title);
        return true;
      });
      deduped.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
      setNaverNews(deduped.slice(0, 30));

      if (finnhub.length > 0) setGlobalNews(finnhub.slice(0, 20));
      setLoading(false);
    }
    loadNews();
  }, []);

  return (
    <div className="pb-20">
      <div className="px-4 mb-3">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold ${filter === f.key ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {(filter === 'all' || filter === 'flow') && (
        <div className="px-4 mb-4"><MoneyFlow /></div>
      )}

      {loading && (
        <div className="px-4 py-8 text-center text-sm text-gray-400 animate-pulse">뉴스 로딩 중...</div>
      )}

      {!loading && (filter === 'all' || filter === 'korea') && naverNews.length > 0 && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold">🇰🇷 한국 주식 뉴스</h3>
            <span className="text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded animate-pulse">LIVE</span>
            <span className="text-[9px] text-gray-400">네이버 뉴스</span>
          </div>
          <div className="space-y-2">
            {naverNews.map((news, i) => (
              <a key={i} href={news.link} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl p-3 border border-gray-100 hover:border-gray-300 transition-colors bg-white">
                <div className="text-sm font-bold leading-snug mb-1">{news.title}</div>
                <div className="text-xs text-gray-500 line-clamp-2 mb-1.5">{news.description}</div>
                <div className="text-[10px] text-gray-400">{formatPubDate(news.pubDate)}</div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!loading && (filter === 'all' || filter === 'global') && globalNews.length > 0 && (
        <div className="px-4">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-bold">🌍 글로벌 뉴스</h3>
            <span className="text-[9px] text-gray-400">Finnhub</span>
          </div>
          <div className="space-y-2">
            {globalNews.map(news => (
              <a key={news.id} href={news.url} target="_blank" rel="noopener noreferrer"
                className="block rounded-xl p-3 border border-gray-100 hover:border-gray-300 transition-colors bg-white">
                <div className="text-sm font-bold leading-snug mb-1">{news.headline}</div>
                {news.summary && (
                  <div className="text-xs text-gray-500 line-clamp-2 mb-1.5">{news.summary}</div>
                )}
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  <span className="font-medium">{news.source}</span>
                  <span>{formatTimeAgo(news.datetime)}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function formatPubDate(pubDate: string): string {
  try {
    const d = new Date(pubDate);
    const now = Date.now();
    const diff = (now - d.getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return pubDate;
  }
}

function formatTimeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;
  return new Date(timestamp * 1000).toLocaleDateString('ko-KR');
}
