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

    if (type === 'search') {
      const q = searchParams.get('q');
      if (!q) return NextResponse.json({ error: '검색어가 필요합니다.' }, { status: 400 });
      url = `${FINNHUB_BASE}/search?q=${encodeURIComponent(q)}&token=${apiKey}`;
    } else if (type === 'profile') {
      const symbol = searchParams.get('symbol');
      if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
      url = `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    } else if (type === 'candle') {
      const symbol = searchParams.get('symbol');
      if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
      const resolution = searchParams.get('resolution') || 'D';
      const to = Math.floor(Date.now() / 1000);
      const from = to - 365 * 24 * 60 * 60;
      url = `${FINNHUB_BASE}/stock/candle?symbol=${encodeURIComponent(symbol)}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
    } else {
      const symbol = searchParams.get('symbol');
      if (!symbol) return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
      url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '데이터를 가져올 수 없습니다.' }, { status: 500 });
  }
}
