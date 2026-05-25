import { NextRequest, NextResponse } from 'next/server';

const KIS_BASE = 'https://openapi.koreainvestment.com:9443';

let cachedToken: { token: string; expires: number } | null = null;

async function getAccessToken(): Promise<string | null> {
  const appKey = process.env.KIS_APP_KEY;
  const appSecret = process.env.KIS_APP_SECRET;
  if (!appKey || !appSecret) return null;

  if (cachedToken && Date.now() < cachedToken.expires) return cachedToken.token;

  try {
    const res = await fetch(`${KIS_BASE}/oauth2/tokenP`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        appkey: appKey,
        appsecret: appSecret,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      cachedToken = {
        token: data.access_token,
        expires: Date.now() + (data.expires_in - 60) * 1000,
      };
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

function kisHeaders(token: string, trId: string) {
  return {
    'Content-Type': 'application/json; charset=utf-8',
    authorization: `Bearer ${token}`,
    appkey: process.env.KIS_APP_KEY!,
    appsecret: process.env.KIS_APP_SECRET!,
    tr_id: trId,
    custtype: 'P',
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'price';
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
  }

  const token = await getAccessToken();
  if (!token) {
    return NextResponse.json({ error: 'KIS 인증 토큰 발급 실패' }, { status: 500 });
  }

  try {
    if (type === 'price') {
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
        { headers: kisHeaders(token, 'FHKST01010100') }
      );
      const data = await res.json();
      if (data.rt_cd !== '0') {
        return NextResponse.json({ error: data.msg1 || 'KIS API 오류' }, { status: 400 });
      }
      const o = data.output;
      return NextResponse.json({
        symbol,
        name: o.hts_kor_isnm,
        price: Number(o.stck_prpr),
        change: Number(o.prdy_vrss),
        changePercent: Number(o.prdy_ctrt),
        open: Number(o.stck_oprc),
        high: Number(o.stck_hgpr),
        low: Number(o.stck_lwpr),
        volume: Number(o.acml_vol),
        prevClose: Number(o.stck_sdpr),
        high52w: Number(o.stck_dryy_hgpr),
        low52w: Number(o.stck_dryy_lwpr),
        marketCap: Number(o.hts_avls),
        per: Number(o.per),
        pbr: Number(o.pbr),
        eps: Number(o.eps),
        bps: Number(o.bps),
      });
    }

    if (type === 'daily') {
      const from = searchParams.get('from') || '';
      const to = searchParams.get('to') || '';
      const period = searchParams.get('period') || 'D';
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?` +
        `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}` +
        `&FID_INPUT_DATE_1=${from}&FID_INPUT_DATE_2=${to}` +
        `&FID_PERIOD_DIV_CODE=${period}&FID_ORG_ADJ_PRC=0`,
        { headers: kisHeaders(token, 'FHKST03010100') }
      );
      const data = await res.json();
      if (data.rt_cd !== '0') {
        return NextResponse.json({ error: data.msg1 || 'KIS API 오류' }, { status: 400 });
      }
      const items = (data.output2 || []).reverse();
      const candles = {
        t: items.map((d: Record<string, string>) => {
          const ds = d.stck_bsop_date;
          return Math.floor(new Date(`${ds.slice(0,4)}-${ds.slice(4,6)}-${ds.slice(6,8)}`).getTime() / 1000);
        }),
        o: items.map((d: Record<string, string>) => Number(d.stck_oprc)),
        h: items.map((d: Record<string, string>) => Number(d.stck_hgpr)),
        l: items.map((d: Record<string, string>) => Number(d.stck_lwpr)),
        c: items.map((d: Record<string, string>) => Number(d.stck_clpr)),
        v: items.map((d: Record<string, string>) => Number(d.acml_vol)),
        s: items.length > 0 ? 'ok' : 'no_data',
      };
      return NextResponse.json(candles);
    }

    if (type === 'minute') {
      const hour = searchParams.get('hour') || '153000';
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice?` +
        `FID_ETC_CLS_CODE=&FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}` +
        `&FID_INPUT_HOUR_1=${hour}&FID_PW_DATA_INCU_YN=Y`,
        { headers: kisHeaders(token, 'FHKST03010200') }
      );
      const data = await res.json();
      if (data.rt_cd !== '0') {
        return NextResponse.json({ error: data.msg1 || 'KIS API 오류' }, { status: 400 });
      }
      const items = (data.output2 || []).reverse();
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const candles = {
        t: items.map((d: Record<string, string>) => {
          const h = d.stck_cntg_hour;
          const dateStr = `${today.slice(0,4)}-${today.slice(4,6)}-${today.slice(6,8)}T${h.slice(0,2)}:${h.slice(2,4)}:${h.slice(4,6)}+09:00`;
          return Math.floor(new Date(dateStr).getTime() / 1000);
        }),
        o: items.map((d: Record<string, string>) => Number(d.stck_oprc)),
        h: items.map((d: Record<string, string>) => Number(d.stck_hgpr)),
        l: items.map((d: Record<string, string>) => Number(d.stck_lwpr)),
        c: items.map((d: Record<string, string>) => Number(d.stck_prpr)),
        v: items.map((d: Record<string, string>) => Number(d.cntg_vol)),
        s: items.length > 0 ? 'ok' : 'no_data',
      };
      return NextResponse.json(candles);
    }

    return NextResponse.json({ error: '잘못된 타입' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'KIS API 오류', detail: String(e) }, { status: 500 });
  }
}
