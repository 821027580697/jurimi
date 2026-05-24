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

export type Tab = 'home' | 'market' | 'asset' | 'news' | 'ai';
export type Currency = 'KRW' | 'USD';
