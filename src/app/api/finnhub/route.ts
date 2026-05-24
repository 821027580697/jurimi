import { NextRequest, NextResponse } from 'next/server';

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'quote';
  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Finnhub API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    let url: string;

    switch (type) {
      case 'search': {
        const q = searchParams.get('q');
        if (!q) return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
        url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
        break;
      }
      case 'profile': {
        const symbol = searchParams.get('symbol');
        if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
        url = `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        break;
      }
      case 'candle': {
        const symbol = searchParams.get('symbol');
        if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
        const resolution = searchParams.get('resolution') || 'D';
        const to = searchParams.get('to') || String(Math.floor(Date.now() / 1000));
        const from = searchParams.get('from') || String(Number(to) - 365 * 24 * 60 * 60);
        url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
        break;
      }
      case 'news': {
        const category = searchParams.get('category') || 'general';
        url = `${FINNHUB_BASE}/news?category=${encodeURIComponent(category)}&token=${apiKey}`;
        break;
      }
      case 'company-news': {
        const symbol = searchParams.get('symbol');
        if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
        const from = searchParams.get('from') || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
        const to = searchParams.get('to') || new Date().toISOString().split('T')[0];
        url = `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${apiKey}`;
        break;
      }
      case 'metrics': {
        const symbol = searchParams.get('symbol');
        if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
        url = `${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${apiKey}`;
        break;
      }
      default: {
        const symbol = searchParams.get('symbol');
        if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
        url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
        break;
      }
    }

    const res = await fetch(url, { next: { revalidate: type === 'news' ? 300 : 30 } });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return NextResponse.json(
        { error: `Finnhub API 오류 (${res.status})`, detail: text },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: '데이터를 가져올 수 없습니다.', detail: String(e) },
      { status: 500 }
    );
  }
}
