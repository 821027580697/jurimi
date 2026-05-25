'use client';

export interface QuoteData {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
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

export interface KISQuoteData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  prevClose: number;
  high52w: number;
  low52w: number;
  marketCap: number;
  per: number;
  pbr: number;
  eps: number;
  bps: number;
}

export function isKoreanStock(code: string): boolean {
  return /^\d{6}$/.test(code);
}

export function toFinnhubSymbol(code: string, usd?: boolean): string {
  if (usd) return code;
  if (isKoreanStock(code)) return `${code}.KS`;
  return code;
}

// ─── Cache ─────────────────────────────────────────────────────────────────

const cache = new Map<string, { data: unknown; ts: number }>();
const CACHE_TTL = 30_000;

async function fetchWithCache<T>(url: string, ttl = CACHE_TTL): Promise<T | null> {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.ts < ttl) return cached.data as T;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    cache.set(url, { data, ts: Date.now() });
    return data as T;
  } catch {
    return null;
  }
}

// ─── KIS API (한국 주식) ────────────────────────────────────────────────────

export async function fetchKISQuote(code: string): Promise<KISQuoteData | null> {
  const data = await fetchWithCache<KISQuoteData>(
    `/api/kis?type=price&symbol=${code}`,
    15_000
  );
  if (!data || !data.price) return null;
  return data;
}

export async function fetchKISCandles(
  code: string,
  period = 'D',
  days = 365
): Promise<CandleData | null> {
  const data = await fetchWithCache<CandleData>(
    `/api/kis?type=daily&symbol=${code}&period=${period}&days=${days}`,
    60_000
  );
  if (!data || data.s !== 'ok' || !data.c?.length) return null;
  return data;
}

export async function fetchKISMinuteCandles(code: string): Promise<CandleData | null> {
  const data = await fetchWithCache<CandleData>(
    `/api/kis?type=minute&symbol=${code}`,
    30_000
  );
  if (!data || data.s !== 'ok' || !data.c?.length) return null;
  return data;
}

// ─── Finnhub API (해외 주식) ────────────────────────────────────────────────

export async function fetchQuote(symbol: string): Promise<QuoteData | null> {
  const data = await fetchWithCache<QuoteData>(
    `/api/finnhub?type=quote&symbol=${encodeURIComponent(symbol)}`
  );
  if (!data || data.c === 0) return null;
  return data;
}

export async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteData>> {
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
  const from = to - days * 86400;
  const data = await fetchWithCache<CandleData>(
    `/api/finnhub?type=candle&symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}`,
    60_000
  );
  if (!data || data.s !== 'ok' || !data.c?.length) return null;
  return data;
}

// ─── 통합 API (한국 → KIS, 해외 → Finnhub) ────────────────────────────────

export async function fetchSmartQuote(
  code: string,
  usd?: boolean
): Promise<QuoteData | null> {
  if (!usd && isKoreanStock(code)) {
    const kis = await fetchKISQuote(code);
    if (kis) {
      return {
        c: kis.price,
        d: kis.change,
        dp: kis.changePercent,
        h: kis.high,
        l: kis.low,
        o: kis.open,
        pc: kis.prevClose,
        t: Math.floor(Date.now() / 1000),
      };
    }
  }
  const sym = toFinnhubSymbol(code, usd);
  return fetchQuote(sym);
}

export async function fetchSmartQuotes(
  holdings: { code: string; usd?: boolean }[]
): Promise<Record<string, QuoteData>> {
  const results: Record<string, QuoteData> = {};
  const promises = holdings.map(async ({ code, usd }) => {
    const q = await fetchSmartQuote(code, usd);
    if (q) results[code] = q;
  });
  await Promise.all(promises);
  return results;
}

export async function fetchSmartCandles(
  code: string,
  usd: boolean,
  resolution = 'D',
  days = 365
): Promise<CandleData | null> {
  if (!usd && isKoreanStock(code)) {
    if (['1', '5', '15', '30'].includes(resolution)) {
      return fetchKISMinuteCandles(code);
    }
    if (resolution === '60') {
      return fetchKISCandles(code, 'D', 30);
    }
    const kisPeriod = resolution === 'W' ? 'W' : resolution === 'M' ? 'M' : 'D';
    const data = await fetchKISCandles(code, kisPeriod, days);
    if (data) return data;
  }
  const sym = toFinnhubSymbol(code, usd);
  const data = await fetchCandles(sym, resolution, days);
  if (data) return data;
  if (!usd && isKoreanStock(code)) {
    return fetchCandles(`${code}.KQ`, resolution, days);
  }
  return null;
}

// ─── News ──────────────────────────────────────────────────────────────────

export async function fetchGeneralNews(): Promise<FinnhubNewsItem[]> {
  const data = await fetchWithCache<FinnhubNewsItem[]>(
    '/api/finnhub?type=news&category=general',
    300_000
  );
  return data || [];
}

export async function fetchCompanyNews(symbol: string): Promise<FinnhubNewsItem[]> {
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
  const data = await fetchWithCache<FinnhubNewsItem[]>(
    `/api/finnhub?type=company-news&symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}`,
    300_000
  );
  return data || [];
}

// ─── Metrics ───────────────────────────────────────────────────────────────

export interface MetricsData {
  metric: {
    '10DayAverageTradingVolume'?: number;
    '52WeekHigh'?: number;
    '52WeekLow'?: number;
    beta?: number;
    currentDividendYieldTTM?: number;
    epsBasicExclExtraItemsTTM?: number;
    marketCapitalization?: number;
    peBasicExclExtraTTM?: number;
    psTTM?: number;
    pbAnnual?: number;
    roeTTM?: number;
    roaTTM?: number;
    revenuePerShareTTM?: number;
    currentRatioQuarterly?: number;
    debtEquityQuarterly?: number;
    netProfitMarginTTM?: number;
    operatingMarginTTM?: number;
    grossMarginTTM?: number;
    dividendPerShareAnnual?: number;
    payoutRatioAnnual?: number;
    revenueGrowthTTMYoy?: number;
    epsGrowthTTMYoy?: number;
  };
}

export async function fetchMetrics(symbol: string): Promise<MetricsData | null> {
  const data = await fetchWithCache<MetricsData>(
    `/api/finnhub?type=metrics&symbol=${encodeURIComponent(symbol)}`,
    120_000
  );
  if (!data || !data.metric) return null;
  return data;
}

export async function fetchSmartMetrics(
  code: string,
  usd?: boolean
): Promise<MetricsData | null> {
  if (!usd && isKoreanStock(code)) {
    const kis = await fetchKISQuote(code);
    if (kis && kis.per > 0) {
      return {
        metric: {
          peBasicExclExtraTTM: kis.per,
          pbAnnual: kis.pbr,
          epsBasicExclExtraItemsTTM: kis.eps,
          '52WeekHigh': kis.high52w,
          '52WeekLow': kis.low52w,
          marketCapitalization: kis.marketCap,
        },
      };
    }
  }
  const sym = toFinnhubSymbol(code, usd);
  return fetchMetrics(sym);
}
