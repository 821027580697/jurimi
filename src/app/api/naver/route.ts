import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q') || '주식';
  const display = searchParams.get('display') || '20';
  const sort = searchParams.get('sort') || 'date';

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: '네이버 API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${display}&sort=${sort}`,
      {
        headers: {
          'X-Naver-Client-Id': clientId,
          'X-Naver-Client-Secret': clientSecret,
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: `네이버 API 오류 (${res.status})` }, { status: res.status });
    }

    const data = await res.json();

    const items = (data.items || []).map((item: Record<string, string>) => ({
      title: item.title?.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'),
      link: item.originallink || item.link,
      description: item.description?.replace(/<[^>]*>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
      pubDate: item.pubDate,
    }));

    return NextResponse.json({ items, total: data.total });
  } catch (e) {
    return NextResponse.json({ error: '네이버 뉴스 조회 실패', detail: String(e) }, { status: 500 });
  }
}
