export interface MarketIndex {
  region: string;
  name: string;
  symbol: string;
  value: number;
  change: number;
  prevClose: number;
}

export interface CurrencyRate {
  pair: string;
  value: number;
  change: number;
}

export interface Commodity {
  name: string;
  icon: string;
  symbol: string;
  value: number;
  change: number;
  unit?: string;
}

export interface MarketData {
  korea: MarketIndex[];
  us: MarketIndex[];
  japan: MarketIndex[];
  china: MarketIndex[];
  europe: MarketIndex[];
  currencies: CurrencyRate[];
  commodities: Commodity[];
}

export interface NewsItem {
  id: number;
  type: string;
  typeColor: string;
  typeEmoji: string;
  title: string;
  summary: string;
  time: string;
  source: string;
  link?: string;
}

export interface SectorCycleItem {
  name: string;
  emoji: string;
  status: "active" | "upcoming" | "future";
  period: string;
  portfolioPct: number;
  ytdReturn: number;
  barColor: string;
}

export interface EventItem {
  date: string;
  name: string;
  icon: string;
  dDay: number;
  highlight: boolean;
}

export interface PortfolioItem {
  name: string;
  code: string;
  qty: number;
  avgPrice: number;
  currentPrice: number;
  sector: string;
  sectorEmoji: string;
  account: "국내" | "해외" | "퇴직연금";
  checklist: string;
  isUsd?: boolean;
}

export interface SectorSummary {
  name: string;
  emoji: string;
  color: string;
  totalValue: number;
  totalCost: number;
  percentage: number;
  items: PortfolioItem[];
}
