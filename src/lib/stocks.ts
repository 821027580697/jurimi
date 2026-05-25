import krData from "@/data/stocks-kr.json";
import usData from "@/data/stocks-us.json";

export interface StockInfo {
  name: string;
  code: string;
  market: "KR" | "US";
  sector?: string;
}

interface KrEntry { n: string; c: string; s: string }
interface UsEntry { n: string; c: string; s: string }

const KR_STOCKS: StockInfo[] = (krData as KrEntry[]).map((e) => ({
  name: e.n,
  code: e.c,
  market: "KR",
  sector: e.s,
}));

const US_STOCKS: StockInfo[] = (usData as UsEntry[]).map((e) => ({
  name: e.n,
  code: e.c,
  market: "US",
  sector: e.s,
}));

const ALL_STOCKS = [...KR_STOCKS, ...US_STOCKS];

// 코드 → 종목 빠른 조회용 맵
const CODE_MAP = new Map<string, StockInfo>();
ALL_STOCKS.forEach((s) => CODE_MAP.set(s.code, s));

export function searchStocks(query: string): StockInfo[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.trim().toLowerCase();

  // 정확한 코드 매칭 우선
  const exact = CODE_MAP.get(q.toUpperCase()) || CODE_MAP.get(q);
  if (exact) return [exact];

  return ALL_STOCKS.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    s.code.toLowerCase().includes(q) ||
    (s.sector && s.sector.toLowerCase().includes(q))
  ).slice(0, 20);
}

export function isKoreanCode(query: string): boolean {
  return /^\d{6}$/.test(query.trim());
}

export function getStockByCode(code: string): StockInfo | undefined {
  return CODE_MAP.get(code);
}

export const TOTAL_STOCK_COUNT = ALL_STOCKS.length;
