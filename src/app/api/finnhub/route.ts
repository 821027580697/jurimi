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

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
