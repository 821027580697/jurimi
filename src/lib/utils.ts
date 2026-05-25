import { EXCHANGE_RATE } from './data';
import { Currency } from './types';

export function formatKRW(value: number): string {
  if (value >= 1_0000_0000) {
    return `${(value / 1_0000_0000).toFixed(1)}억원`;
  }
  if (value >= 1_0000) {
    return `${Math.round(value / 10000)}만원`;
  }
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatUSD(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPrice(value: number, isUsd: boolean, currency: Currency): string {
  if (currency === 'USD' && !isUsd) {
    return `$${(value / EXCHANGE_RATE).toFixed(2)}`;
  }
  if (currency === 'KRW' && isUsd) {
    return `${Math.round(value * EXCHANGE_RATE).toLocaleString('ko-KR')}원`;
  }
  if (isUsd) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatNativePrice(value: number, isUsd: boolean): string {
  if (isUsd) {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatChange(chg: number): { text: string; color: string } {
  if (chg > 0) return { text: `▲ +${chg.toFixed(2)}%`, color: '#FF2D2D' };
  if (chg < 0) return { text: `▼ ${chg.toFixed(2)}%`, color: '#2D6CFF' };
  return { text: `— 0.00%`, color: '#999999' };
}

export function getCheckScore(check: string): number {
  const match = check.match(/^(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

export function getDdayText(dday: number): string {
  if (dday === 0) return 'D-Day';
  return `D-${dday}`;
}

export function calculatePortfolioValue(
  holdings: { qty: number; cur: number; usd?: boolean }[],
  currency: Currency
): number {
  return holdings.reduce((sum, h) => {
    const value = h.qty * h.cur;
    if (h.usd && currency === 'KRW') return sum + value * EXCHANGE_RATE;
    if (!h.usd && currency === 'USD') return sum + value / EXCHANGE_RATE;
    return sum + value;
  }, 0);
}

export function calculatePL(
  holdings: { qty: number; avg: number; cur: number; usd?: boolean }[],
  currency: Currency
): { amount: number; percent: number } {
  let totalCost = 0;
  let totalValue = 0;
  for (const h of holdings) {
    const cost = h.qty * h.avg;
    const value = h.qty * h.cur;
    if (h.usd && currency === 'KRW') {
      totalCost += cost * EXCHANGE_RATE;
      totalValue += value * EXCHANGE_RATE;
    } else if (!h.usd && currency === 'USD') {
      totalCost += cost / EXCHANGE_RATE;
      totalValue += value / EXCHANGE_RATE;
    } else {
      totalCost += cost;
      totalValue += value;
    }
  }
  const amount = totalValue - totalCost;
  const percent = totalCost > 0 ? (amount / totalCost) * 100 : 0;
  return { amount, percent };
}
