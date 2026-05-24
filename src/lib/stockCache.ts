'use client';

import { Stock } from './types';

const CACHE_KEY = 'jurimi-stock-cache';

export interface SearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

function inferSector(industry: string, type: string): string {
  const i = (industry || '').toLowerCase();
  const t = (type || '').toLowerCase();
  if (i.includes('semiconductor') || i.includes('반도체')) return '💾';
  if (i.includes('aerospace') || i.includes('defense') || i.includes('우주') || i.includes('방산')) return '🚀';
  if (i.includes('robot') || i.includes('로봇')) return '🤖';
  if (i.includes('pharma') || i.includes('bio') || i.includes('바이오') || i.includes('제약')) return '💊';
  if (i.includes('auto') || i.includes('vehicle') || i.includes('자동차')) return '🚗';
  if (i.includes('energy') || i.includes('electric') || i.includes('전력') || i.includes('에너지')) return '⚡';
  if (i.includes('bank') || i.includes('financial') || i.includes('금융') || i.includes('증권')) return '🏦';
  if (i.includes('software') || i.includes('internet') || i.includes('tech') || i.includes('IT')) return '📱';
  if (i.includes('battery') || i.includes('2차전지') || i.includes('배터리')) return '🔋';
  if (i.includes('construct') || i.includes('material') || i.includes('건설') || i.includes('소재')) return '🏗️';
  if (i.includes('game') || i.includes('entertain') || i.includes('게임') || i.includes('엔터')) return '🎮';
  if (i.includes('retail') || i.includes('consumer') || i.includes('유통') || i.includes('소비')) return '🛒';
  if (t === 'etp' || t === 'etf') return '📊';
  return '📈';
}

function isUsdSymbol(symbol: string): boolean {
  return !symbol.includes('.KS') && !symbol.includes('.KQ');
}

export function buildStockFromAPI(
  symbol: string,
  name: string,
  quote: { c: number; dp: number; pc: number } | null,
  profile: { finnhubIndustry?: string; marketCapitalization?: number; currency?: string } | null,
  type?: string,
): Stock {
  const price = quote?.c || 0;
  const chg = quote?.dp || 0;
  const usd = isUsdSymbol(symbol);
  const industry = profile?.finnhubIndustry || '';
  const mcap = profile?.marketCapitalization || 0;

  let capStr = '-';
  if (mcap > 0) {
    if (usd) {
      if (mcap >= 1000) capStr = `$${(mcap / 1000).toFixed(1)}T`;
      else if (mcap >= 1) capStr = `$${mcap.toFixed(0)}B`;
      else capStr = `$${(mcap * 1000).toFixed(0)}M`;
    } else {
      const krwCap = mcap * 100_000_000;
      if (krwCap >= 1_0000_0000_0000) capStr = `${(krwCap / 1_0000_0000_0000).toFixed(1)}조`;
      else capStr = `${Math.round(krwCap / 1_0000_0000)}억`;
    }
  }

  const displaySymbol = symbol.replace('.KS', '').replace('.KQ', '');

  return {
    name,
    code: displaySymbol,
    sector: inferSector(industry, type || ''),
    price,
    chg,
    per: '-',
    roe: '-',
    rev: '-',
    cap: capStr,
    check: '-/-',
    analyst: '-',
    tp: '-',
    op: '-',
    desc: industry || (type || ''),
    news: [],
    usd,
    aiScore: undefined,
    _finnhubSymbol: symbol,
  } as Stock & { _finnhubSymbol?: string };
}

export function loadCachedStocks(): Record<string, Stock> {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return {};
}

export function saveCachedStock(stock: Stock) {
  try {
    const cache = loadCachedStocks();
    cache[stock.code] = stock;
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}
