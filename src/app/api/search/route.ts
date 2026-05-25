import { NextRequest, NextResponse } from "next/server";

const KIS_BASE = "https://openapi.koreainvestment.com:9443";
const FINNHUB_BASE = "https://finnhub.io/api/v1";

let cachedToken: { token: string; expires: number } | null = null;

async function getKisToken(): Promise<string | null> {
  const appKey = process.env.KIS_APP_KEY;
  const appSecret = process.env.KIS_APP_SECRET;
  if (!appKey || !appSecret) return null;
  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;

  try {
    const res = await fetch(`${KIS_BASE}/oauth2/tokenP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "client_credentials", appkey: appKey, appsecret: appSecret }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      cachedToken = { token: data.access_token, expires: Date.now() + (data.expires_in - 120) * 1000 };
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

// Finnhub 심볼 검색 — 미국 전체 종목 검색 가능
async function searchFinnhub(query: string) {
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch(`${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${apiKey}`);
    if (!res.ok) return [];
    const data = await res.json();

    return (data.result || [])
      .filter((r: Record<string, string>) => r.type === "Common Stock" || r.type === "ETP" || r.type === "ADR")
      .slice(0, 15)
      .map((r: Record<string, string>) => ({
        name: r.description,
        code: r.symbol,
        market: "US" as const,
        type: r.type,
      }));
  } catch {
    return [];
  }
}

// KIS 종목 코드로 직접 조회 — 한국 전체 종목 코드 조회 가능
async function lookupKisCode(code: string) {
  const token = await getKisToken();
  if (!token) return null;

  try {
    const res = await fetch(
      `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${code}`,
      {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          authorization: `Bearer ${token}`,
          appkey: process.env.KIS_APP_KEY!,
          appsecret: process.env.KIS_APP_SECRET!,
          tr_id: "FHKST01010100",
          custtype: "P",
        },
      }
    );
    const data = await res.json();
    if (data.rt_cd !== "0") return null;

    const o = data.output;
    const name = o.hts_kor_isnm;
    if (!name || name.trim() === "") return null;

    return {
      name,
      code,
      market: "KR" as const,
      price: Number(o.stck_prpr),
      changePercent: Number(o.prdy_ctrt),
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  // 6자리 숫자 → 한국 종목코드 직접 조회
  if (/^\d{6}$/.test(q)) {
    const stock = await lookupKisCode(q);
    if (stock) {
      return NextResponse.json({
        results: [stock],
        source: "kis",
      });
    }
    return NextResponse.json({ results: [], source: "kis" });
  }

  // 영문 → Finnhub 심볼 검색 (미국 전체 종목)
  if (/[a-zA-Z]/.test(q)) {
    const results = await searchFinnhub(q);
    return NextResponse.json({ results, source: "finnhub" });
  }

  // 한글 → 현재는 로컬 DB에서만 검색 (API에서는 빈 결과)
  return NextResponse.json({ results: [], source: "local" });
}
