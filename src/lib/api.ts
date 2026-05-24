'use client';

export interface QuoteData {
  c: number;   // current
  d: number;   // change
  dp: number;  // change percent
  h: number;   // high
  l: number;   // low
  o: number;   // open
  pc: number;  // previous close
  t: number;   // timestamp
}

export interface CandleData {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
}

export interface FinnhubNewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

export function toFinnhubSymbol(code: string, usd?: boolean): string {
  if (usd) return code;
  if (/^\d{6}$/.test(code)) return `${code}.KS`;
  return code;
}

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30_000;

async function fetchWithCache<T>(url: string, ttl = CACHE_TTL): Promise<T | null> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data as T;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(url, { data, ts: Date.now() });
    return data as T;
  } catch {
    return null;
  }
}

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const data = await fetchWithCache<QuoteData>(
    `/api/finnhub?type=quote&symbol=${encodeURIComponent(symbol)}`
  );
  if (!data || data.c === 0) return null;
  return data;
}

export async function fetchQuotes(
  symbols: string[]
): Promise<Record<string, QuoteData>> {
  const results: Record<string, QuoteData> = {};
  const promises = symbols.map(async sym => {
    const q = await fetchQuote(sym);
    if (q) results[sym] = q;
  });
  await Promise.all(promises);
  return results;
}

export async function fetchCandles(
  symbol: string,
  resolution = 'D',
  days = 365
): Promise<CandleData | null> {
  const to = Math.floor(Date.now() / 1000);
  const from = to - days * 24 * 60 * 60;
  const data = await fetchWithCache<CandleData>(
    `/api/finnhub?type=candle&symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`,
    60_000
  );
  if (!data || data.s !== 'ok' || !data.c?.length) return null;
  return data;
}

export async function fetchGeneralNews(): Promise<FinnhubNewsItem[]> {
  const data = await fetchWithCache<FinnhubNewsItem[]>(
    '/api/finnhub?type=news&category=general',
    300_000
  );
  return data || [];
}

export async function fetchCompanyNews(symbol: string): Promise<FinnhubNewsItem[]> {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const data = await fetchWithCache<FinnhubNewsItem[]>(
    `/api/finnhub?type=company-news&symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`,
    300_000
  );
  return data || [];
}
