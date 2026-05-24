'use client';

import { useState } from 'react';
import { newsItems } from '@/lib/data';
import { NewsItem } from '@/lib/types';
import MoneyFlow from './MoneyFlow';

type Filter = 'all' | 'flow' | 'surge' | 'macro';

const filterLabels: Record<Filter, string> = {
  all: '전체',
  flow: '💰돈흐름',
  surge: '🚨급등락',
  macro: '🌍매크로',
};

const typeColors: Record<NewsItem['type'], string> = {
  surge: 'bg-red-50 border-red-200',
  good: 'bg-green-50 border-green-200',
  ipo: 'bg-purple-50 border-purple-200',
  flow: 'bg-blue-50 border-blue-200',
  macro: 'bg-gray-50 border-gray-200',
};

const typeBadge: Record<NewsItem['type'], { text: string; color: string }> = {
  surge: { text: '🔴급등', color: 'text-red-600' },
  good: { text: '🟢호재', color: 'text-green-600' },
  ipo: { text: '🟣IPO', color: 'text-purple-600' },
  flow: { text: '🔵돈흐름', color: 'text-blue-600' },
  macro: { text: '⚪매크로', color: 'text-gray-600' },
};

export default function NewsFeed() {
  const [filter, setFilter] = useState<Filter>('all');

  const filtered = filter === 'all'
    ? newsItems
    : newsItems.filter(n => {
        if (filter === 'surge') return n.type === 'surge' || n.type === 'good';
        if (filter === 'flow') return n.type === 'flow';
        return n.type === 'macro';
      });

  return (
    <div className="pb-20">
      <div className="px-4 mb-3">
        <div className="flex gap-2">
          {(Object.keys(filterLabels) as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-bold ${
                filter === f ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {(filter === 'all' || filter === 'flow') && (
        <div className="px-4 mb-4">
          <MoneyFlow />
        </div>
      )}

      <div className="px-4 space-y-2">
        {filtered.map((news, i) => {
          const badge = typeBadge[news.type];
          return (
            <div
              key={i}
              className={`rounded-xl p-3 border ${typeColors[news.type]}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${badge.color}`}>{badge.text}</span>
                <span className="text-[10px] text-gray-400">{news.time}</span>
              </div>
              <div className="text-sm font-bold">{news.title}</div>
              <div className="flex gap-1.5 mt-2">
                {news.tags.map((tag, j) => (
                  <span key={j} className="text-[10px] bg-white/80 text-gray-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
