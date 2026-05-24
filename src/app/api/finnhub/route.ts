import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get('symbol');
  const type = searchParams.get('type') || 'quote';
  const apiKey = process.env.NEXT_PUBLIC_FINNHUB_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Finnhub API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  if (!symbol) {
    return NextResponse.json({ error: '종목 코드가 필요합니다.' }, { status: 400 });
  }

  try {
    let url: string;

    if (type === 'candle') {
      const resolution = searchParams.get('resolution') || 'D';
      const to = Math.floor(Date.now() / 1000);
      const from = to - 365 * 24 * 60 * 60;
      url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${apiKey}`;
    } else {
      url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: '데이터를 가져올 수 없습니다.' }, { status: 500 });
  }
}
