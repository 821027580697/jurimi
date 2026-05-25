const API_KEY = process.env.FINNHUB_API_KEY || "";
const BASE = "https://finnhub.io/api/v1";

export async function finnhubQuote(symbol: string) {
  const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${API_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

export async function finnhubMultiQuote(symbols: string[]) {
  const results: Record<string, { c: number; dp: number; d: number; pc: number }> = {};
  await Promise.all(
    symbols.map(async (sym) => {
      try {
        const data = await finnhubQuote(sym);
        if (data && data.c > 0) results[sym] = data;
      } catch {}
    })
  );
  return results;
}
