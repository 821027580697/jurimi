import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.FINNHUB_API_KEY || "";
const BASE = "https://finnhub.io/api/v1";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "quote";
  const symbol = searchParams.get("symbol") || "";

  if (!API_KEY) {
    return NextResponse.json({ error: "Finnhub API 키 미설정" }, { status: 500 });
  }

  try {
    if (type === "quote") {
      const res = await fetch(`${BASE}/quote?symbol=${symbol}&token=${API_KEY}`);
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (type === "multi") {
      const symbols = searchParams.get("symbols")?.split(",") || [];
      const results: Record<string, unknown> = {};
      await Promise.all(
        symbols.map(async (sym) => {
          try {
            const res = await fetch(`${BASE}/quote?symbol=${sym.trim()}&token=${API_KEY}`);
            const data = await res.json();
            if (data && data.c > 0) results[sym.trim()] = data;
          } catch {}
        })
      );
      return NextResponse.json(results);
    }

    // 캔들 차트 데이터 (일봉)
    if (type === "candle") {
      const resolution = searchParams.get("resolution") || "D";
      const days = Number(searchParams.get("days") || "90");
      const to = Math.floor(Date.now() / 1000);
      const from = to - days * 86400;

      const res = await fetch(
        `${BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${API_KEY}`
      );
      const data = await res.json();

      if (data.s !== "ok" || !data.c?.length) {
        return NextResponse.json({ candles: [], s: "no_data" });
      }

      const candles = data.t.map((t: number, i: number) => ({
        date: new Date(t * 1000).toISOString().split("T")[0],
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));

      return NextResponse.json({ candles, s: "ok" });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
