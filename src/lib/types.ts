export interface Stock {
  name: string;
  code: string;
  sector: string;
  price: number;
  chg: number;
  per: string;
  roe: string;
  rev: string;
  cap: string;
  check: string;
  analyst: string;
  tp: string;
  op: string;
  desc: string;
  news: string[];
  usd?: boolean;
  aiScore?: number;
}

export interface Holding {
  name: string;
  code: string;
  qty: number;
  avg: number;
  cur: number;
  sector?: string;
  check?: string;
  usd?: boolean;
  type?: string;
}

export interface MarketIndex {
  name: string;
  flag: string;
  value: number;
  chg: number;
}

export interface NewsItem {
  type: 'surge' | 'good' | 'ipo' | 'flow' | 'macro';
  title: string;
  time: string;
  tags: string[];
}

export interface EventItem {
  emoji: string;
  name: string;
  dday: number;
}

export type Tab = 'home' | 'market' | 'asset' | 'news' | 'ai' | 'bookmark';
export type Currency = 'KRW' | 'USD';

export const SECTOR_LIST: { emoji: string; name: string }[] = [
  { emoji: '💾', name: '반도체' },
  { emoji: '🚀', name: '우주/방산' },
  { emoji: '🤖', name: '로봇' },
  { emoji: '👓', name: 'AR/XR' },
  { emoji: '💊', name: '바이오' },
  { emoji: '🚗', name: '자동차' },
  { emoji: '⚡', name: '전력/에너지' },
  { emoji: '🏦', name: '금융' },
  { emoji: '📱', name: 'IT/플랫폼' },
  { emoji: '🔋', name: '2차전지' },
  { emoji: '🏗️', name: '건설/소재' },
  { emoji: '🎮', name: '엔터/게임' },
  { emoji: '🛒', name: '유통/소비재' },
];
