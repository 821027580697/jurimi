const FINNHUB_KEY = process.env.NEXT_PUBLIC_FINNHUB_KEY || '';

export async function fetchQuote(symbol: string): Promise<{ c: number; dp: number } | null> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchCandles(
  symbol: string,
  resolution: string = 'D',
  from?: number,
  to?: number
): Promise<{
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  t: number[];
  v: number[];
  s: string;
} | null> {
  const now = to || Math.floor(Date.now() / 1000);
  const start = from || now - 365 * 24 * 60 * 60;
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${start}&to=${now}&token=${FINNHUB_KEY}`
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
