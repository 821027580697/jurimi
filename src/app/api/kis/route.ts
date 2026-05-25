import { NextRequest, NextResponse } from "next/server";

const KIS_BASE = "https://openapi.koreainvestment.com:9443";

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string | null> {
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

function kisHeaders(token: string, trId: string) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    authorization: `Bearer ${token}`,
    appkey: process.env.KIS_APP_KEY!,
    appsecret: process.env.KIS_APP_SECRET!,
    tr_id: trId,
    custtype: "P",
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "price";
  const symbol = searchParams.get("symbol") || "";

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: "KIS 인증 실패" }, { status: 500 });
  }

  try {
    if (type === "price") {
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
        { headers: kisHeaders(token, "FHKST01010100") }
      );
      const data = await res.json();
      if (data.rt_cd !== "0") {
        return NextResponse.json({ error: data.msg1 || "조회 실패" }, { status: 400 });
      }
      const o = data.output;
      return NextResponse.json({
        symbol,
        name: o.hts_kor_isnm,
        price: Number(o.stck_prpr),
        change: Number(o.prdy_vrss),
        changePercent: Number(o.prdy_ctrt),
        prevClose: Number(o.stck_sdpr),
        volume: Number(o.acml_vol),
      });
    }

    if (type === "index") {
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-index-price?FID_COND_MRKT_DIV_CODE=U&FID_INPUT_ISCD=${symbol}`,
        { headers: kisHeaders(token, "FHPUP02100000") }
      );
      const data = await res.json();
      if (data.rt_cd !== "0") {
        return NextResponse.json({ error: data.msg1 || "지수 조회 실패" }, { status: 400 });
      }
      const o = data.output;
      return NextResponse.json({
        symbol,
        value: Number(o.bstp_nmix_prpr),
        change: Number(o.bstp_nmix_prdy_ctrt),
        prevClose: Number(o.bstp_nmix_prdy_clpr),
      });
    }

    if (type === "multi-price") {
      const symbols = searchParams.get("symbols")?.split(",") || [];
      const results: Record<string, { price: number; changePercent: number }> = {};
      await Promise.all(
        symbols.map(async (sym) => {
          try {
            const res = await fetch(
              `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${sym.trim()}`,
              { headers: kisHeaders(token, "FHKST01010100") }
            );
            const data = await res.json();
            if (data.rt_cd === "0") {
              results[sym.trim()] = {
                price: Number(data.output.stck_prpr),
                changePercent: Number(data.output.prdy_ctrt),
              };
            }
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
