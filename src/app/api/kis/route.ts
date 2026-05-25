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
      body: JSON.stringify({ grant_type: 'client_credentials', appkey: appKey, appsecret: appSecret }),
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
    'Content-Type': 'application/json; charset=utf-8',
    authorization: `Bearer ${token}`,
    appkey: process.env.KIS_APP_KEY!,
    appsecret: process.env.KIS_APP_SECRET!,
    tr_id: trId,
    custtype: 'P',
  };
}

function dateStr(d: Date): string {
  return d.toISOString().split('T')[0].replace(/-/g, '');
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
    return NextResponse.json({ error: 'KIS 인증 실패. APP_KEY/APP_SECRET을 확인하세요.' }, { status: 500 });
  }

  try {
    // ─── 현재가 조회 ────────────────────────────────────────────────────
    if (type === 'price') {
      const res = await fetch(
        `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-price?FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}`,
        { headers: kisHeaders(token, 'FHKST01010100') }
      );
      const data = await res.json();
      if (data.rt_cd !== '0') {
        return NextResponse.json({ error: data.msg1 || 'KIS 현재가 조회 실패' }, { status: 400 });
      }
      const o = data.output;
      return NextResponse.json({
        symbol,
        name: o.hts_kor_isnm,
        price: Number(o.stck_prpr),
        change: Number(o.prdy_vrss),
        changePercent: Number(o.prdy_ctrt),
        changeSign: o.prdy_vrss_sign,
        open: Number(o.stck_oprc),
        high: Number(o.stck_hgpr),
        low: Number(o.stck_lwpr),
        volume: Number(o.acml_vol),
        tradeAmount: Number(o.acml_tr_pbmn),
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

    // ─── 일/주/월봉 (페이지네이션 지원) ──────────────────────────────────
    if (type === 'daily') {
      const period = searchParams.get('period') || 'D';
      const days = Number(searchParams.get('days') || '365');
      const toDate = new Date();
      const fromDate = new Date(Date.now() - days * 86400000);

      const allItems: Record<string, string>[] = [];
      let currentTo = dateStr(toDate);
      const targetFrom = dateStr(fromDate);

      for (let page = 0; page < 10; page++) {
        const url =
          `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?` +
          `FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}` +
          `&FID_INPUT_DATE_1=${targetFrom}&FID_INPUT_DATE_2=${currentTo}` +
          `&FID_PERIOD_DIV_CODE=${period}&FID_ORG_ADJ_PRC=0`;

        const res = await fetch(url, { headers: kisHeaders(token, 'FHKST03010100') });
        const data = await res.json();
        if (data.rt_cd !== '0' || !data.output2?.length) break;

        const items = data.output2 as Record<string, string>[];
        const newItems = items.filter(d => d.stck_bsop_date >= targetFrom);
        allItems.push(...newItems);

        const lastDate = items[items.length - 1]?.stck_bsop_date;
        if (!lastDate || lastDate <= targetFrom || items.length < 30) break;

        const prevDay = new Date(`${lastDate.slice(0,4)}-${lastDate.slice(4,6)}-${lastDate.slice(6,8)}`);
        prevDay.setDate(prevDay.getDate() - 1);
        currentTo = dateStr(prevDay);
      }

      const seen = new Set<string>();
      const unique = allItems.filter(d => {
        if (seen.has(d.stck_bsop_date)) return false;
        seen.add(d.stck_bsop_date);
        return true;
      });
      unique.sort((a, b) => a.stck_bsop_date.localeCompare(b.stck_bsop_date));

      const filtered = unique.filter(d =>
        Number(d.stck_clpr) > 0 && Number(d.stck_oprc) > 0
      );

      return NextResponse.json({
        t: filtered.map(d => {
          const ds = d.stck_bsop_date;
          return Math.floor(new Date(`${ds.slice(0,4)}-${ds.slice(4,6)}-${ds.slice(6,8)}T09:00:00+09:00`).getTime() / 1000);
        }),
        o: filtered.map(d => Number(d.stck_oprc)),
        h: filtered.map(d => Number(d.stck_hgpr)),
        l: filtered.map(d => Number(d.stck_lwpr)),
        c: filtered.map(d => Number(d.stck_clpr)),
        v: filtered.map(d => Number(d.acml_vol)),
        s: filtered.length > 0 ? 'ok' : 'no_data',
      });
    }

    // ─── 분봉 (당일) ────────────────────────────────────────────────────
    if (type === 'minute') {
      const allItems: Record<string, string>[] = [];
      let lastHour = '160000';

      for (let page = 0; page < 5; page++) {
        const url =
          `${KIS_BASE}/uapi/domestic-stock/v1/quotations/inquire-time-itemchartprice?` +
          `FID_ETC_CLS_CODE=&FID_COND_MRKT_DIV_CODE=J&FID_INPUT_ISCD=${symbol}` +
          `&FID_INPUT_HOUR_1=${lastHour}&FID_PW_DATA_INCU_YN=Y`;

        const res = await fetch(url, { headers: kisHeaders(token, 'FHKST03010200') });
        const data = await res.json();
        if (data.rt_cd !== '0' || !data.output2?.length) break;

        const items = data.output2 as Record<string, string>[];
        allItems.push(...items);

        const last = items[items.length - 1]?.stck_cntg_hour;
        if (!last || items.length < 30 || last <= '090000') break;
        lastHour = last;
      }

      const seen = new Set<string>();
      const unique = allItems.filter(d => {
        if (seen.has(d.stck_cntg_hour)) return false;
        seen.add(d.stck_cntg_hour);
        return Number(d.stck_prpr) > 0;
      });
      unique.sort((a, b) => a.stck_cntg_hour.localeCompare(b.stck_cntg_hour));

      const today = dateStr(new Date());

      return NextResponse.json({
        t: unique.map(d => {
          const h = d.stck_cntg_hour;
          return Math.floor(new Date(
            `${today.slice(0,4)}-${today.slice(4,6)}-${today.slice(6,8)}T${h.slice(0,2)}:${h.slice(2,4)}:${h.slice(4,6)}+09:00`
          ).getTime() / 1000);
        }),
        o: unique.map(d => Number(d.stck_oprc)),
        h: unique.map(d => Number(d.stck_hgpr)),
        l: unique.map(d => Number(d.stck_lwpr)),
        c: unique.map(d => Number(d.stck_prpr)),
        v: unique.map(d => Number(d.cntg_vol)),
        s: unique.length > 0 ? 'ok' : 'no_data',
      });
    }

    return NextResponse.json({ error: '잘못된 요청 타입입니다.' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: 'KIS API 오류', detail: String(e) }, { status: 500 });
  }
}
